var game // for development to access game object in browser

// Game logic
$(document).ready(function() {
  game = new Game
  View.enablePauseButton()
});

// Game model

function Game() {
  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [GameOptions.COMMAND_CENTER];
  this.isBuilding = false;
  this.currentBuildOrder = undefined;
  this.currentBuildTicker = 0; // increase this one per tick; check, push and reset in build function

  this.setBuildListeners();
  this.startGameCycle();
}

Game.prototype.startGameCycle = function() {
  setInterval(this.coreGameLoop.bind(this), 500);
}

Game.prototype.coreGameLoop = function() {
  this.updateResources();
  View.updateBuildProgress(this.buildProgress());
  View.updateBuildingCount(this.calculateBuildingCount());
  View.displayResources(this.resources);
  View.displayResourceFlow(this.calculateResourcesPerCycle());
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
    matterThisCycle += this.buildings[i].matterProduction;
    energyThisCycle += this.buildings[i].energyProduction;
  }
  return {matter: matterThisCycle, energy: energyThisCycle}
}

Game.prototype.calculateBuildingCount = function() {
  var buildings = {}
  for (var i = 0; i < this.buildings.length; i++) {
    if( buildings[this.buildings[i].name]) {
      buildings[this.buildings[i].name] += 1;
    } else {
      buildings[this.buildings[i].name] = 1;
    }
  }
  return buildings;
}

Game.prototype.setBuildListeners = function() {
  $("#new-solar").on("click", null, "Solar Power Plant", this.build.bind(this));
  $("#new-mine").on("click", null, "Matter Mine", this.build.bind(this));
}

Game.prototype.buildProgress = function() {
  var percentBuilt = 0;
  if (this.currentBuildOrder) {
    this.currentBuildTicker++;
    percentBuilt = (this.currentBuildTicker / this.currentBuildOrder.buildTime) * 100;
    if (this.currentBuildTicker === this.currentBuildOrder.buildTime) {
      this.buildings.push(this.currentBuildOrder);
      this.currentBuildOrder = undefined;
      this.currentBuildTicker = 0;
    }
  }
  return percentBuilt; // return an integer between 0 and 100
}

Game.prototype.build = function(event) {
  var building = new Building(BuildingsList[event.data]);
  if (building.matterCost >= this.resources.matter) {
    console.log("insuffcient matter to build " + building.name);
  } else if (building.energyCost >= this.resources.energy) {
    console.log("insuffcient energy to build " + building.name);
  } else if (this.currentBuildOrder) {
    console.log("Already building " + this.currentBuildOrder.name + ".");
  } else {
    this.currentBuildOrder = building;
    this.resources.matter -= building.matterCost;
    this.resources.energy -= building.energyCost;
  }
}

// Buildings List

var BuildingsList = {
  "Command Center":    {name: "Command Center",
                        matterCost: 5000,
                        energyCost: 50000,
                        matterProduction: 2,
                        energyProduction: 25,
                        buildTime: 1000},

  "Matter Mine":       {name: "Matter Mine",
                        matterCost: 50,
                        energyCost: 520,
                        matterProduction: 2,
                        energyProduction: -5,
                        buildTime: 20},

  "Solar Power Plant": {name: "Solar Power Plant",
                        matterCost: 150,
                        energyCost: 800,
                        matterProduction: 0,
                        energyProduction: 20,
                        buildTime: 10}
}

// Game constants

var GameOptions = {
  STARTING_MATTER: 1000,
  STARTING_ENERGY: 5000,
  COMMAND_CENTER: new Building(BuildingsList["Command Center"])
}

// Building model

function Building(options) {
  this.name = options.name;
  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
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

View.enablePauseButton = function() {
  $("#pause").on("click", function() {alert("Game Paused.")})
}
  return View;
})();
