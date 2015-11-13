var RESOURCE_CYCLE = 12;

function Game() {
  this.frameRate = 25;

  this.coreTimer = 0;
  this.timeRunning = 0;
  this.difficultyLevel = 1;

  this.buildings = [];
  this.destroyedBuildings = [];
  this.isBuilding = false;
  this.selectedBuilding = undefined;

  this.enemies = [];
  this.destroyedEnemies = [];

  this.resourceManager = new ResourceManager(this.buildings, new ConstructionManager(this.buildings), GameOptions.STARTING_MATTER, GameOptions.STARTING_ENERGY);

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
    this.resourceManager.tick();
    this.fireBuildingsAtEnemies();
    View.displayResources(this.resourceManager);
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

Game.prototype.updateTime = function() {
  View.updateTimer(this.secondsRunning());
};

Game.prototype.moveEnemies = function() {
  for (var i = 0; i < this.enemies.length; i++) {
    this.enemies[i].moveOrAttack(this.buildings);
  }
};

Game.prototype.spawnEnemies = function() {
  var newEnemies = EnemyFactory.build(this.difficultyLevel, this.buildings, this.board);
  for (var i = 0; i < newEnemies.length; i++) {
    var x = this.board.width;
    var y = Math.floor(Math.random() * this.board.height);
    newEnemies[i].topLeftX = x;
    newEnemies[i].topLeftY = y;
    this.enemies.push(newEnemies[i]);
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

Game.prototype.chooseBuilding = function(buildingButtonClick) {
  this.selectedBuilding = new Building(BuildingsList[buildingButtonClick.data], this);
  View.highlightBuildingByElement(buildingButtonClick.delegateTarget);
};

Game.prototype.chooseBuildingFromKey = function(event) {
  var buildingId = BuildingSelector.getBuildingIdByKeyCode(event.keyCode);
  if (BuildingsList[buildingId]) {
    this.selectedBuilding = new Building(BuildingsList[buildingId], this);
    View.highlightBuildingById(buildingId);
  } else {
    this.selectedBuilding = undefined;
    View.deselectBuilding();
  }
};

Game.prototype.build = function(xOnBoard,yOnBoard) {
  if (this.resourceManager.buildSlotAvailable()) {
    var building = this.selectedBuilding;
    building.setPosition(xOnBoard, yOnBoard);
    this.board.placeBuilding(building);
    this.buildings.push(building);
    this.resourceManager.startBuildingConstruction(building)
    this.selectedBuilding = undefined;
    View.deselectBuilding();
  } else {
    View.displayStatusMessage("Insufficient build slots to build more.");
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
  return this.resourceManager.isEnergyOver(energyNeeded);
};

Game.prototype.deductEnergy = function(deduction) {
  this.resourceManager.deductEnergy(deduction);
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

var EnemyFactory = {
  enemiesPerWave: 5,
  build: function(level, possibleTargets, board) {
    var enemies = [];
    var enemyCount = this.maxEnemies(level);
    var baseZergOdds = 0.05;
    var baseGargantuanOdds = 0.05

    while (enemies.length < enemyCount) {
      if (this.enemyRoll(baseZergOdds, level)) {
        for (var i = 0; i < 3 * level; i++) {
          enemies.push(this.levelUp(BaseEnemies.zerg, level, possibleTargets, board));
        }
      } else if (this.enemyRoll(baseGargantuanOdds, level)) {
        enemies.push(this.levelUp(BaseEnemies.gargantuan, level, possibleTargets, board));
      } else {
        enemies.push(this.levelUp(BaseEnemies.normal, level, possibleTargets, board));
      }
    }
    return enemies;
  },
  maxEnemies: function(level) {
    return Math.floor(Math.random() * this.enemiesPerWave * level);
  },
  enemyRoll: function(baseOdds, level) {
    return Math.random() < (baseOdds * level);
  },
  levelUp: function(defaultOptions, level, possibleTargets, board) {
    var leveledOptions = {
      size: defaultOptions.size,
      speed: (level / 5) + defaultOptions.speed,
      hp: defaultOptions.hp * level,
      damage: defaultOptions.damage,
      target: this.chooseBuildingTarget(possibleTargets),
      topLeftX: board.width,
      topLeftY: Math.floor(Math.random() * board.height)
    }
    return new Enemy(leveledOptions);
  },
  chooseBuildingTarget: function(buildings) {
    var BIAS_FOR_CC_AS_TARGET = 0.8;
    if (Math.random() > BIAS_FOR_CC_AS_TARGET) {
      return buildings[0]
    } else {
      return this.chooseRandomBuildingTarget(buildings);
    }
  },
  chooseRandomBuildingTarget: function(buildings) {
    var index = Math.floor(Math.random() * buildings.length);
    return buildings[index];
  }
};

Array.prototype.sample = function() {
  return this[Math.floor(Math.random() * this.length)]
}


