var game; // for development to access game object in browser

// Game logic
$(document).ready(function() {
  View.prependBuildingButtons(BuildingsList)
  View.enablePauseButton();
  game = new Game;
});

// Board model

function Board(options) {
  this.width = options.width || 800;
  this.height = options.height || 400;
  this.gridSize = options.gridSize || 20;
  this.canvas = View.appendCanvas(this.width, this.height);
  this.context = this.canvas.getContext('2d');

  this.needsUpdate = true;
  this.internalStorage = Board.buildStorageGrid(this.width/20, this.height/20);
  this.buildingToPlace = undefined;
  this.setUpClickListeners();
}

Board.prototype.setUpClickListeners = function() {
  $(this.canvas).on("click", this.handleClicks.bind(this));
}

Board.prototype.handleClicks = function(event) {
  if (this.buildingToPlace) {
    var potentialX = Math.floor(event.offsetX / this.gridSize);
    var potentialY = Math.floor(event.offsetY / this.gridSize);
     if (this.isGridAvailable(this.buildingToPlace, potentialX, potentialY)) {
      this.buildingToPlace.topLeftX = potentialX;
      this.buildingToPlace.topLeftY = potentialY;
      this.placeBuilding(this.buildingToPlace);
     } else { View.displayStatusMessage("Cannot build on top of an existing building.") }
  }
}

Board.prototype.placeBuilding = function(building) {
  for(var x = building.topLeftX; x < building.topLeftX + building.size.x; x++) {
    for(var y = building.topLeftY; y < building.topLeftY + building.size.y; y++) {
      this.internalStorage[x][y] = new Cell(building, [building.topLeftX, building.topLeftY]);
    }
  }
  this.drawBuilding(building);
  building.active = true;
  this.buildingToPlace = undefined;
}

Board.prototype.isGridAvailable = function(building, xToCheck, yToCheck) {
  var isAvailable = true
  for(var x = xToCheck; x < xToCheck + building.size.x; x++) {
    for(var y = yToCheck; y < yToCheck + building.size.y; y++) {
      if (this.internalStorage[x][y]) { return false; }
    }
  }
  return isAvailable
}

Board.prototype.completeRefresh = function(buildings) {
  this.clearCanvas();
  this.drawGrid();
  this.placeAllBuildings(buildings);
  this.needsUpdate = false;
}

Board.prototype.clearCanvas = function() {
  this.context.clearRect(0, 0, this.width, this.height);
}

Board.prototype.drawGrid = function() {
  for (var x = -1; x <= this.width; x += this.gridSize) {
    this.context.moveTo(0.5 + x, 0);
    this.context.lineTo(0.5 + x, this.height);
  }
  for (var y = -1; y <= this.height; y += this.gridSize) {
    this.context.moveTo(0, 0.5 + y);
    this.context.lineTo(this.width, 0.5 + y);
  }
  this.context.strokeStyle = "#CCC";
  this.context.stroke();
}

Board.prototype.placeAllBuildings = function(buildings) {
  for (var i = 0; i < buildings.length; i++) {
    this.placeBuilding(buildings[i]);
  }
}

Board.prototype.drawBuilding = function(building) {
  this.context.fillStyle = building.color;
  this.context.fillRect(building.topLeftX * this.gridSize, building.topLeftY * this.gridSize, building.size.x * this.gridSize, building.size.y * this.gridSize);
}

Board.buildStorageGrid = function(rows, cols) {
  var grid = [];
  for (var x = 0; x < rows; x++) {
    grid.push([]);
    for (var y = 0; y < cols; y++) {
      grid[x].push("");
    }
  }
  return grid;
}

// Board Cell model

function Cell(building, topLeft) {
  this.building = building;
  this.topLeft = topLeft;
}

// Game model

function Game() {
  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [];
  this.isBuilding = false;
  this.currentBuildOrder = undefined;
  this.currentBuildTicker = 0; // increase this one per tick; check, push and reset in build function

  this.board = new Board({width: 800, height: 400, gridSize: 20});

  this.buildInitialBuildings();
  this.setBuildListeners();
  this.startGameCycle();
}

Game.prototype.buildInitialBuildings = function() {
  var commandCenter = GameOptions.COMMAND_CENTER; // eventually change into an array of "starting buildings"
  commandCenter.topLeftX = 0;
  commandCenter.topLeftY = Math.floor(this.board.height / this.board.gridSize / 2) - (commandCenter.size.y / 2);
  this.board.placeBuilding(commandCenter);
  this.buildings.push(commandCenter);
}

Game.prototype.startGameCycle = function() {
  setInterval(this.coreGameLoop.bind(this), 500);
  setInterval(this.updateBoardLoop.bind(this), 20);
}

Game.prototype.coreGameLoop = function() {
  this.updateResources();
  View.updateBuildProgress(this.buildProgress());
  View.updateBuildingCount(this.calculateBuildingCount());
  View.displayResources(this.resources);
  View.displayResourceFlow(this.calculateResourcesPerCycle());
}

Game.prototype.updateBoardLoop = function() {
  if (this.board.needsUpdate) {
    this.board.completeRefresh(this.buildings);
  }
}

Game.prototype.updateResources = function() {
  var resourcesToAdd = this.calculateResourcesPerCycle(); // return {matter: x, energy: y}
  this.resources.matter += resourcesToAdd.matter;
  if (this.resources.matter < 0) {this.resources.matter = 0}
  this.resources.energy += resourcesToAdd.energy;
  if (this.resources.energy < 0) {this.resources.energy = 0}
}

Game.prototype.calculateResourcesPerCycle = function() {
  var matterThisCycle = 0;
  var energyThisCycle = 0;
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].active) {
      matterThisCycle += this.buildings[i].matterProduction;
      energyThisCycle += this.buildings[i].energyProduction;
    }
  }
  return {matter: matterThisCycle, energy: energyThisCycle}
}

Game.prototype.calculateBuildingCount = function() {
  var buildingsCount = {}
  for (var i = 0; i < this.buildings.length; i++) {
    if( buildingsCount[this.buildings[i].name]) {
      buildingsCount[this.buildings[i].name] += 1;
    } else {
      buildingsCount[this.buildings[i].name] = 1;
    }
  }
  return buildingsCount;
}

Game.prototype.setBuildListeners = function() {
  for (var i = 0; i < BuildingsList.length; i++) {
    $("#new-building-" + i).on("click", null, i, this.build.bind(this));
  }
}

Game.prototype.buildProgress = function() {
  var percentBuilt = 0;
  if (this.currentBuildOrder) {
    this.currentBuildTicker++;
    // percentBuilt = (this.currentBuildTicker / this.currentBuildOrder.buildTime) * 100;
    percentBuilt = (this.currentBuildTicker / this.currentBuildOrder.buildTime) * 100 * 8; // increase divisor to speed up building for testing
    if (this.currentBuildTicker >= this.currentBuildOrder.buildTime / 8) { // increase divisor to speed up building for testing
    // if (this.currentBuildTicker >= this.currentBuildOrder.buildTime) {
      this.board.buildingToPlace = this.currentBuildOrder;
      this.buildings.push(this.currentBuildOrder);
      this.currentBuildOrder = undefined;
      this.currentBuildTicker = 0;
    }
  }
  return percentBuilt; // return an integer between 0 and 100
}

Game.prototype.build = function(buildingButtonClick) {
  var building = new Building(BuildingsList[buildingButtonClick.data]);
  if (this.board.buildingToPlace) {
    View.displayStatusMessage("Place previously built " + this.board.buildingToPlace.name + " first.");
  } else if (this.currentBuildOrder) {
    View.displayStatusMessage("Already building " + this.currentBuildOrder.name + ".");
    console.log("Already building " + this.currentBuildOrder.name + ".");
  } else if (building.energyCost >= this.resources.energy) {
    View.displayStatusMessage("Insuffcient energy to build " + building.name);
    console.log("Insuffcient energy to build " + building.name);
  } else if (building.matterCost >= this.resources.matter) {
    View.displayStatusMessage("Insuffcient matter to build " + building.name);
    console.log("Insuffcient matter to build " + building.name);
  } else {
    this.currentBuildOrder = building;
    this.resources.matter -= building.matterCost;
    this.resources.energy -= building.energyCost;
  }
}

// Buildings List

var BuildingsList = [
{name: "Command Center",
hp: 3000,
matterCost: 5000,
energyCost: 50000,
matterProduction: 2,
energyProduction: 25,
buildTime: 1000,
benefit: "Your home base",
size: {x:4, y:4},
color: "#060",
active: true},

{name: "Matter Mine",
hp: 200,
matterCost: 50,
energyCost: 520,
matterProduction: 2,
energyProduction: -5,
buildTime: 18,
benefit: "+2 matter / t",
size: {x:2, y:2},
color: "#699"},

{name: "Solar Power Plant",
hp: 100,
matterCost: 150,
energyCost: 800,
matterProduction: 0,
energyProduction: 20,
buildTime: 24,
benefit: "+20 energy / t",
size: {x:2, y:2},
color: "#FF6"},

{name: "Laser Tower",
hp: 500,
matterCost: 150,
energyCost: 800,
matterProduction: 0,
energyProduction: 0,
energyPerShot: 200,
damagePerShot: 50,
fireTime: 1,
buildTime: 40,
benefit: "50 damage per shot",
size: {x:1, y:1},
color: "#F00"},

{name: "Build Slot",
hp: 100,
matterCost: 1000,
energyCost: 5000,
matterProduction: -5,
energyProduction: -10,
buildTime: 50,
benefit: "build more at once",
size: {x:1, y:1},
color: "#060"}
]

// Game constants

var GameOptions = {
  STARTING_MATTER: 1000,
  STARTING_ENERGY: 5000,
  COMMAND_CENTER: new Building(BuildingsList[0])
}

// Building model

function Building(options) {
  this.name = options.name;
  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
  this.size = options.size;
  this.color = options.color;
  this.active = options.active || false;
  this.topLeftX = undefined;
  this.topLeftY = undefined;
}

// View

var View = (function() {
  View = {};
  View.displayResources = function(resources) {
    $("#matter-display").text("Matter: " + resources.matter);
    $("#energy-display").text("Energy: " + resources.energy);
  }

  View.displayResourceFlow = function(flow) {
    $("#net-matter-flow").text("Flow: " + flow.matter);
    $("#net-energy-flow").text("Flow: " + flow.energy);
  }

// TODO: refactor to allow any number of building names / counts
View.updateBuildingCount = function(buildings) {
  $("#solar-plant-count").html("Solar Power Plants: " + (buildings["Solar Power Plant"] || "0"));
  $("#matter-mine-count").html("Matter Mines: " + (buildings["Matter Mine"] || "0"));
}

View.updateBuildProgress = function(progress) {
  $("progress").attr("value", progress);
}

View.displayStatusMessage = function(message) {
  $("#status-message").text(message);
}

View.enablePauseButton = function() {
  $("#pause").on("click", function() {alert("Game Paused.")});
}

View.appendCanvas = function(width, height) {
  return $("<canvas id='canvas' width='" + width + "' height='" + height + "'></canvas>").appendTo("#main-container")[0];
}

View.prependBuildingButtons = function(buildingsList) {
  for (var i = 0; i < buildingsList.length; i++) {
    $("#build-menu").prepend(this.buildingsTemplate(buildingsList[i], i));
  }
}

View.buildingsTemplate = function(building, buildingIndex) {
  var attrWhitelist = ["name", "hp", "matterCost", "energyCost", "benefit", "size"];
  var htmlString = "<div><table>";
  for (attr in building) {
    if (attrWhitelist.indexOf(attr) >= 0) {
      htmlString += "<tr>"
      htmlString += "<td>" + attr + ": </td>"
      if (attr === "size") {
        htmlString += "<td>" + building[attr].x + " x " + building[attr].y + "</td>"
      } else {
        htmlString += "<td>" + building[attr] + "</td>"
      }
      htmlString += "</tr>"
    }
  }
  htmlString += "</table><button id='new-building-" + buildingIndex + "'>Build " + building.name + "</button></div>"
  return htmlString
}
return View;
})();


