// Game model

function Game() {
  this.frameRate = 25;

  this.coreTimer = 0;
  this.timeRunning = 0;
  this.difficultyLevel = 1;

  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [];
  this.destroyedBuildings = [];
  this.isBuilding = false;
  this.selectedBuilding = undefined;
  this.currentBuildOrder = undefined;
  // this.currentBuildTicker = 0; // the building will now know when it's built

  this.enemies = [];
  this.destroyedEnemies = [];

  this.board = new Board({width: 800, height: 400, gridSize: 20, game: this});
  this.buildInitialBuildings();
  this.board.buildingRefresh(this.buildings);
  this.setBuildListeners();
  this.startGameCycle();
}

Game.prototype.secondsRunning = function() {
  return Math.floor(this.coreTimer / this.frameRate);
}

Game.prototype.buildInitialBuildings = function() {
  this.commandCenter = GameOptions.COMMAND_CENTER; // TKTKTK: eventually change into an array of "starting buildings"
  this.commandCenter.position.x = 0;
  this.commandCenter.position.y = Math.floor(this.board.height / 2) - (this.commandCenter.size.y * this.board.gridSize / 2);
  this.buildings.push(this.commandCenter);
  this.board.buildingRefresh(this.buildings);
}

Game.prototype.setBuildListeners = function() {
  View.setBuildListeners(BuildingsList, this);
}

Game.prototype.startGameCycle = function() {
  this.coreLoopId = setInterval(this.coreGameLoop.bind(this), 1000 / this.frameRate);
}

Game.prototype.coreGameLoop = function() {
  this.coreTimer++;
  this.runDrawCycle();
  if (this.coreTimer % 5 === 0) {
    this.runBuildCycle();
  }
  if (this.coreTimer % 12 === 0) {
    this.runResourceCycle();
  }
  if (this.coreTimer % 25 === 0) {
    this.updateTime();
  }
  if (this.coreTimer % 125 === 0) {
    this.spawnEnemies();
  }
  if (this.coreTimer % 3000 === 0) {
    this.difficultyLevel++;
  }
}

Game.prototype.runResourceCycle = function() {
  if (this.buildings[0] === this.commandCenter) {
    this.updateResources();
    this.buildingsFire();
    View.updateBuildProgress(this.buildProgress());
    View.displayResources(this.resources);
    View.displayResourceFlow(this.buildingProducedResources(), this.constructionResourceCosts());
    View.updateScore(this.destroyedEnemies.length, this.destroyedBuildings.length)
  } else {
    clearInterval(this.coreLoopId);
    View.displayGameOver(this.destroyedEnemiesStats(), this.destroyedBuildingsStats(), this.secondsRunning());
  }
}

Game.prototype.runDrawCycle = function() {
  this.moveEnemies();
  this.board.refreshEnemies(this.enemies);
  this.board.drawAllHp(this.buildings);
  this.board.buildingsNeedUpdate = this.areBuildingsDestroyed()
  this.board.enemiesNeedUpdate = this.areEnemiesDestroyed()
  if (this.board.buildingsNeedUpdate) {
    this.board.buildingRefresh(this.buildings);
  }
  if (this.board.enemiesNeedUpdate) {
    this.board.refreshEnemies(this.enemies);
  }
}

Game.prototype.runBuildCycle = function() {
  this.buildCurrentBuildOrder();
}

Game.prototype.updateTime = function() {
  View.updateTimer(this.secondsRunning());
}

Game.prototype.updateResources = function() {
  var resourcesToAdd = this.buildingProducedResources(); // return {matter: x, energy: y}
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
  var difficulty = Difficulty.calculate(this.difficultyLevel);
  for (var i = difficulty.maxEnemies; i > 0; i--) {
    var x = this.board.width;
    var y = Math.floor(Math.random() * this.board.height);
    // TKTKTK: create different enemy types with different sizes / strengths
    // ...can eventually live in the Difficulty module
    this.enemies.push(new Enemy({topLeftX: x, topLeftY: y, size: 10, hp: difficulty.enemyHp, target: this.commandCenter}));
  }
}

Game.prototype.buildingProducedResources = function() {
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

Game.prototype.constructionResourceCosts = function() {
  var matterThisCycle = 0;
  var energyThisCycle = 0;
  if (this.currentBuildOrder) {
    matterThisCycle = this.currentBuildOrder.matterCost / (this.currentBuildOrder.buildTime * 12); // TKTKTK: 12 should be a constant.
    energyThisCycle = this.currentBuildOrder.energyCost / (this.currentBuildOrder.buildTime * 12); // It's the resource cycle.
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
  // if (this.currentBuildOrder) {
  //   if (this.board.buildingToPlace) {
  //     View.displayStatusMessage("Wait for " + this.board.buildingToPlace.name + " to finish building first.");
  //   } else {
  //     this.board.buildingToPlace = this.currentBuildOrder;
  //   }
  // }
  return percentBuilt; // return an integer between 0 and 100
}

Game.prototype.currentBuildingComplete = function() {
  this.currentBuildOrder = undefined;
}

Game.prototype.chooseBuilding = function(buildingButtonClick) {
  this.selectedBuilding = new Building(BuildingsList[buildingButtonClick.data], this);
  View.highlightBuildingByElement(buildingButtonClick.delegateTarget);
}

Game.prototype.chooseBuildingFromKey = function(event) {
  var buildingId = BuildingSelector.getBuildingIdByKeyCode(event.keyCode)
  this.selectedBuilding = new Building(BuildingsList[buildingId], this);
  View.highlightBuildingById(buildingId);
}

Game.prototype.build = function(xOnBoard,yOnBoard) {
  var building = this.selectedBuilding
  if (this.currentBuildOrder) {
    View.displayStatusMessage("Already building " + this.currentBuildOrder.name + ".");
    console.log("Already building " + this.currentBuildOrder.name + ".");
  } else if (building.energyCost >= this.resources.energy) {
    View.displayStatusMessage("Insuffcient energy to build " + building.name);
    console.log("Insuffcient energy to build " + building.name);
  } else if (building.matterCost >= this.resources.matter) {
    View.displayStatusMessage("Insuffcient matter to build " + building.name);
    console.log("Insuffcient matter to build " + building.name);
  } else {
    building.setPosition(xOnBoard, yOnBoard);
    this.board.placeBuilding(building);
    this.buildings.push(building);
    this.currentBuildOrder = building;
    this.selectedBuilding = undefined;
    View.deselectBuilding();
  }
}

Game.prototype.buildCurrentBuildOrder = function() {
  var building = this.currentBuildOrder
  if (building) {
    if (building.completed) {
      building = undefined;
    } else {
      building.continueBuilding();
      this.resources.matter -= building.matterToDeductPerCycle();
      this.resources.energy -= building.energyToDeductPerCycle();
    }
  }
}

Game.prototype.areBuildingsDestroyed = function() {
  var isAtLeastOneDestroyed = false
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].isDestroyed()) {
      isAtLeastOneDestroyed = true;
      if (!this.buildings[i].completed) {
        this.currentBuildOrder = undefined;
      }
      this.destroyedBuildings.push(this.buildings.splice(i, 1)[0]);
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
    // if it has a position.x it must already be placed
    if (this.buildings[i].damagePerShot && this.buildings[i].position.x) {
      this.buildings[i].fireAt(this.enemies);
    }
  }
}

Game.prototype.hasEnergyInSurplusOf = function(energyNeeded) {
  return this.resources.energy > energyNeeded;
}

Game.prototype.deductEnergy = function(deduction) {
  this.resources.energy -= deduction;
}

Game.prototype.destroyedEnemiesStats = function() {
  var totalDamageDealt = this.destroyedEnemies.reduce(function(previousValue, enemy, index, array) {
    return previousValue + enemy.maxHp;
  }, 0);
  return {totalDamageDealt: totalDamageDealt, numDestroyed: this.destroyedEnemies.length}
}

Game.prototype.destroyedBuildingsStats = function() {
  var totalDamageDealt = this.destroyedBuildings.reduce(function(previousValue, building, index, array) {
    return previousValue + building.maxHp;
  }, 0);
  return {totalDamageDealt: totalDamageDealt, numDestroyed: this.destroyedBuildings.length}
}

var Difficulty = {}

Difficulty.calculate = function(level) {
  return {
    maxEnemies: this.maxEnemies(level),
    enemyHp: this.enemyHp(level)
  }
}

Difficulty.maxEnemies = function(level) {
  // TKTKTK: store this 5 enemies per wave var on the game/invariant data somewhere...
  return Math.floor(Math.random() * 5 * level);
}

Difficulty.enemyHp = function(level) {
  // TKTKTK: where should this 50 base hp per level live?
  return 50 * level;
}
