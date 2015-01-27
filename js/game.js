// Game model

function Game() {
  this.timeRunning = 0;

  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [];
  this.destroyedBuildings = [];
  this.isBuilding = false;
  this.currentBuildOrder = undefined;
  this.currentBuildTicker = 0; // increases once per tick to keep track of when a building is complete;

  this.enemies = [];
  this.destroyedEnemies = [];

  this.board = new Board({width: 800, height: 400, gridSize: 20});
  this.buildInitialBuildings();
  this.board.completeRefresh(this.buildings);
  this.setBuildListeners();
  this.startGameCycle();
}

Game.prototype.buildInitialBuildings = function() {
  this.commandCenter = GameOptions.COMMAND_CENTER; // TKTKTK: eventually change into an array of "starting buildings"
  this.commandCenter.topLeftX = 0;
  this.commandCenter.topLeftY = Math.floor(this.board.height / 2) - (this.commandCenter.size.y * this.board.gridSize / 2);
  this.buildings.push(this.commandCenter);
  this.board.completeRefresh(this.buildings);
}

Game.prototype.setBuildListeners = function() {
  View.setBuildListeners(BuildingsList, this);
}

Game.prototype.startGameCycle = function() {
  this.coreLoopId = setInterval(this.coreGameLoop.bind(this), 500);
  this.boardLoopId = setInterval(this.updateBoardLoop.bind(this), 40);
}

Game.prototype.coreGameLoop = function() {
  if (this.buildings[0] === this.commandCenter) {
    this.updateTime();
    this.updateResources();
    this.spawnEnemies();
    this.buildingsFire();
    View.updateBuildProgress(this.buildProgress());
    View.displayResources(this.resources);
    View.displayResourceFlow(this.calculateResourcesPerCycle());
  } else {
    clearInterval(this.coreLoopId);
    clearInterval(this.boardLoopId);
    View.displayGameOver();
  }
}

  Game.prototype.updateBoardLoop = function() {
    this.moveEnemies();
    this.board.refreshEnemies(this.enemies);
    this.board.drawAllHp(this.buildings);
    this.board.needsUpdate = (this.areBuildingsDestroyed() | this.areEnemiesDestroyed())
    if (this.board.needsUpdate) {
      this.board.completeRefresh(this.buildings);
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

Game.prototype.moveEnemies = function() {
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].moveOrAttack(this.buildings);
  }
}

Game.prototype.spawnEnemies = function() {
  var interval = this.timeRunning % 5; // every 5 seconds; TKTKTK: store this the modulus on the game somewhere
  if (interval === 0) {
    var max = Math.floor(Math.random() * 10); // TKTKTK: store this var on the game somewhere...
    for (var i = max; i > 0; i--) {
      var x = this.board.width;
      var y = Math.floor(Math.random() * this.board.height);
      this.enemies.push(new Enemy({topLeftX: x, topLeftY: y, size: 10})); // TKTKTK: create different enemy types with different sizes / strengths
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
    if (!this.board.buildingToPlace && this.currentBuildTicker >= this.currentBuildOrder.buildTime / 8) { // increase divisor to speed up building for testing
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

Game.prototype.areBuildingsDestroyed = function() {
  var isAtLeastOneDestroyed = false
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].isDestroyed()) {
      this.destroyedBuildings.push(this.buildings.splice(i, 1)[0]);
      isAtLeastOneDestroyed = true;
    }
  }
  return isAtLeastOneDestroyed;
}

Game.prototype.areEnemiesDestroyed = function() {
  var isAtLeastOneDestroyed = false
  for (var i = 0; i < this.enemies.length; i++) {
    if (this.enemies[i].isDestroyed()) {
      this.destroyedEnemies.push(this.enemies.splice(i, 1)[0]);
      isAtLeastOneDestroyed = true;
    }
  }
  return isAtLeastOneDestroyed;
}

Game.prototype.buildingsFire = function() {
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].damagePerShot && this.buildings[i].topLeftX) {
      this.buildings[i].fireAt(this.enemies);
    }
  }
}

