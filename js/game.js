// Game model

function Game() {
  this.timeRunning = 0

  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [];
  this.isBuilding = false;
  this.currentBuildOrder = undefined;
  this.currentBuildTicker = 0; // increase this one per tick; check, push and reset in build function

  this.enemies = [];

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

Game.prototype.setBuildListeners = function() {
  for (var i = 0; i < BuildingsList.length; i++) {
    $("#new-building-" + i).on("click", null, i, this.build.bind(this));
  }
}

Game.prototype.startGameCycle = function() {
  setInterval(this.coreGameLoop.bind(this), 500);
  setInterval(this.updateBoardLoop.bind(this), 20);
}

Game.prototype.coreGameLoop = function() {
  this.updateTime();
  this.updateResources();
  this.spawnEnemies();
  View.updateBuildProgress(this.buildProgress());
  View.displayResources(this.resources);
  View.displayResourceFlow(this.calculateResourcesPerCycle());
}

Game.prototype.updateBoardLoop = function() {
  if (this.board.needsUpdate) {
    this.board.completeRefresh(this.buildings); // will also need to send enemies
  }
}

Game.prototype.updateTime = function() {
  View.updateTimer(Math.floor(this.timeRunning += 0.5));
}

Game.prototype.updateResources = function() {
  var resourcesToAdd = this.calculateResourcesPerCycle(); // return {matter: x, energy: y}
  this.resources.matter += resourcesToAdd.matter;
  if (this.resources.matter < 0) {this.resources.matter = 0}
  this.resources.energy += resourcesToAdd.energy;
  if (this.resources.energy < 0) {this.resources.energy = 0}
}

Game.prototype.spawnEnemies = function() {
  var interval = this.timeRunning % 5; // TKTKTK: seconds
  if (interval === 0) {
    var max = Math.floor(Math.random() * 10); // TKTKTK: store this var on the game somewhere...
    for (var i = max; i > 0; i--) {
      this.enemies.push(new Enemy({}));
    }
  }
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
