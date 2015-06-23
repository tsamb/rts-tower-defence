var RESOURCE_CYCLE = 12;

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
};

Game.prototype.buildInitialBuildings = function() {
  this.commandCenter = GameOptions.COMMAND_CENTER; // TODO -> eventually change into an array of "starting buildings"
  this.commandCenter.position.x = 0;
  this.commandCenter.position.y = Math.floor(this.board.height / 2) - (this.commandCenter.size.y * this.board.gridSize / 2);
  this.buildings.push(this.commandCenter);
  this.board.buildingRefresh(this.buildings);
};

Game.prototype.setBuildListeners = function() {
  View.setBuildListeners(BuildingsList, this);
};

Game.prototype.startGameCycle = function() {
  this.coreLoopId = setInterval(this.coreGameLoop.bind(this), 1000 / this.frameRate);
};

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
};

Game.prototype.runResourceCycle = function() {
  if (this.buildings[0] === this.commandCenter) {
    this.updateResources();
    this.fireBuildingsAtEnemies();
    View.displayResources(this.resources);
    View.displayResourceFlow(this.buildingProducedResources(), this.constructionResourceCosts());
    View.updateScore(this.destroyedEnemies.length, this.destroyedBuildings.length);
  } else {
    clearInterval(this.coreLoopId);
    View.displayGameOver(
      this.statsForDestroyed(this.destroyedEnemies),
      this.statsForDestroyed(this.destroyedBuildings),
      this.secondsRunning()
    );
  }
};

Game.prototype.runDrawCycle = function() {
  this.moveEnemies();
  this.board.refreshEnemies(this.enemies);
  this.board.drawAllHp(this.buildings);
  this.board.buildingsNeedUpdate = this.wereUnitsDestroyed(this.buildings, this.destroyedBuildings);
  this.board.enemiesNeedUpdate = this.wereUnitsDestroyed(this.enemies, this.destroyedEnemies);
  if (this.board.buildingsNeedUpdate) {
    this.board.buildingRefresh(this.buildings);
  }
  if (this.board.enemiesNeedUpdate) {
    this.board.refreshEnemies(this.enemies);
  }
};

Game.prototype.runBuildCycle = function() {
  this.buildCurrentBuildOrder();
};

Game.prototype.updateTime = function() {
  View.updateTimer(this.secondsRunning());
};

Game.prototype.updateResources = function() {
  var resourcesToAdd = this.buildingProducedResources();
  this.resources.matter += resourcesToAdd.matter;
  this.resources.energy += resourcesToAdd.energy;
  if (this.resources.matter < 0) { this.resources.matter = 0; }
  if (this.resources.energy < 0) { this.resources.energy = 0; }
};

Game.prototype.moveEnemies = function() {
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].moveOrAttack(this.buildings);
  }
};

// TODO -> create different enemy types with different sizes / strengths
// ...can eventually live in the Difficulty module
Game.prototype.spawnEnemies = function() {
  var difficulty = Difficulty.calculate(this.difficultyLevel);
  for (var i = difficulty.maxEnemies; i > 0; i--) {
    var x = this.board.width;
    var y = Math.floor(Math.random() * this.board.height);
    this.enemies.push(new Enemy({
      topLeftX: x,
      topLeftY: y,
      hp: difficulty.enemyHp,
      speed: difficulty.speed,
      target: this.chooseBuildingTarget()})
    );
  }
};

Game.prototype.chooseBuildingTarget = function() {
  var BIAS_FOR_CC_AS_TARGET = 0.8;
  if (Math.random() > BIAS_FOR_CC_AS_TARGET) {
    return this.commandCenter
  } else {
    return this.chooseRandomBuildingTarget();
  }
}

Game.prototype.chooseRandomBuildingTarget = function() {
  var index = Math.floor(Math.random() * this.buildings.length);
  return this.buildings[index];
};

Game.prototype.buildingProducedResources = function() {
  var matterThisCycle = 0;
  var energyThisCycle = 0;
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].active) {
      matterThisCycle += this.buildings[i].matterProduction;
      energyThisCycle += this.buildings[i].energyProduction;
    }
  }
  return {
    matter: matterThisCycle,
    energy: energyThisCycle
  };
};

Game.prototype.constructionResourceCosts = function() {
  if (!this.currentBuildOrder) { return {matter: 0, energy: 0}; }
  return {
    matter: this.currentBuildOrder.matterCost / (this.currentBuildOrder.buildTime * RESOURCE_CYCLE),
    energy: this.currentBuildOrder.energyCost / (this.currentBuildOrder.buildTime * RESOURCE_CYCLE)
  };
};

Game.prototype.currentBuildingComplete = function() {
  this.currentBuildOrder = undefined;
};

Game.prototype.chooseBuilding = function(buildingButtonClick) {
  this.selectedBuilding = new Building(BuildingsList[buildingButtonClick.data], this);
  View.highlightBuildingByElement(buildingButtonClick.delegateTarget);
};

Game.prototype.chooseBuildingFromKey = function(event) {
  var buildingId = BuildingSelector.getBuildingIdByKeyCode(event.keyCode);
  this.selectedBuilding = new Building(BuildingsList[buildingId], this);
  View.highlightBuildingById(buildingId);
};

Game.prototype.build = function(xOnBoard,yOnBoard) {
  var building = this.selectedBuilding;
  if (this.currentBuildOrder) {
    View.displayStatusMessage("Already building " + this.currentBuildOrder.name + ".");
  } else if (building.energyCost >= this.resources.energy) {
    View.displayStatusMessage("Insufficient energy to build " + building.name);
  } else if (building.matterCost >= this.resources.matter) {
    View.displayStatusMessage("Insufficient matter to build " + building.name);
  } else {
    building.setPosition(xOnBoard, yOnBoard);
    this.board.placeBuilding(building);
    this.buildings.push(building);
    this.currentBuildOrder = building;
    this.selectedBuilding = undefined;
    View.deselectBuilding();
  }
};

Game.prototype.buildCurrentBuildOrder = function() {
  var building = this.currentBuildOrder;
  if (building && !building.completed) {
    building.continueBuilding();
    this.resources.matter -= building.matterToDeductPerCycle();
    this.resources.energy -= building.energyToDeductPerCycle();
  }
};

Game.prototype.fireBuildingsAtEnemies = function() {
  for (var i = 0; i < this.buildings.length; i++) {
    if (this.buildings[i].canFire()) {
      this.buildings[i].fireAt(this.enemies);
    }
  }
};

Game.prototype.hasEnergyInSurplusOf = function(energyNeeded) {
  return this.resources.energy > energyNeeded;
};

Game.prototype.deductEnergy = function(deduction) {
  this.resources.energy -= deduction;
};

Game.prototype.wereUnitsDestroyed = function(units, unitGraveyard) {
  var isAtLeastOneDestroyed = false;
  for (var i = 0; i < units.length; i++) {
    if (units[i].isDestroyed()) {
      unitGraveyard.push(units.splice(i, 1)[0]);
      isAtLeastOneDestroyed = true;
    }
  }
  return isAtLeastOneDestroyed;
};

Game.prototype.statsForDestroyed = function(units) {
  var totalDamageDealt = units.reduce(function(previousValue, unit) {
    return previousValue + unit.maxHp;
  }, 0);
  return {
    totalDamageDealt: totalDamageDealt,
    numDestroyed: units.length
  };
};

var Difficulty = {
  baseHp: 50, // consider moving static difficulty properties to invariant-data.js
  enemiesPerWave: 5,
  calculate: function(level) {
    return {
      maxEnemies: this.maxEnemies(level),
      enemyHp: this.enemyHp(level),
      speed: this.speed(level)
    };
  },
  maxEnemies: function(level) {
    return Math.floor(Math.random() * this.enemiesPerWave * level);
  },
  enemyHp: function(level) {
    return this.baseHp * level;
  },
  speed: function(level) {
    return (level / 5) + 2;
  }
};
