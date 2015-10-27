function ResourceManager(collection, constructionManager, startingMatter, startingEnergy) {
  this.collection = collection;
  this.constructionManager = constructionManager;
  this.matter = startingMatter ? startingMatter : 0;
  this.energy = startingEnergy ? startingEnergy : 0;
  this.energyIncome = 0;
  this.energyExpenses = 0;
  this.matterIncome = 0;
  this.matterExpenses = 0;
}

ResourceManager.prototype.tick = function() {
  this.constructionManager.setBuildAllowances();
  this.applyIncome();
  this.constructBuildings();
  this.applyExpenses();
}

ResourceManager.prototype.startBuildingConstruction = function(building) {
  this.constructionManager.push(building)
}

ResourceManager.prototype.constructBuildings = function() {
  this.constructionManager.continueBuildingAll(this.matter, this.energy);
}

ResourceManager.prototype.calculateCurrentIncome = function() {
  var matterInThisCycle = 0;
  var energyInThisCycle = 0;
  for (var i = 0; i < this.collection.length; i++) {
    if (this.collection[i].active) {
      matterInThisCycle += this.collection[i].matterProduction;
      energyInThisCycle += this.collection[i].energyProduction;
    }
  }
  this.matterIncome = matterInThisCycle;
  this.energyIncome = energyInThisCycle;
  return  {matterInThisCycle: matterInThisCycle,
          energyInThisCycle: energyInThisCycle}
}

ResourceManager.prototype.calculateCurrentExpenses = function() {
  var matterOutThisCycle = 0;
  var energyOutThisCycle = 0;
  energyOutThisCycle += this.constructionManager.energyCosts();
  matterOutThisCycle += this.constructionManager.matterCosts();
  this.matterExpenses = matterOutThisCycle;
  this.energyExpenses = energyOutThisCycle;
  return  {matterOutThisCycle: matterOutThisCycle,
          energyOutThisCycle: energyOutThisCycle}
}

ResourceManager.prototype.applyIncome = function() {
  var income = this.calculateCurrentIncome();
  this.matter += income.matterInThisCycle;
  this.energy += income.energyInThisCycle;
}

ResourceManager.prototype.applyExpenses = function() {
  var expenses = this.calculateCurrentExpenses();
  if (this.matter - expenses.matterOutThisCycle < 0) {
    this.matter = 0;
  } else {
    this.matter -= expenses.matterOutThisCycle;
  }
  if (this.energy - expenses.energyOutThisCycle < 0) {
    this.energy = 0;
  } else {
    this.energy -= expenses.energyOutThisCycle;
  }
}

ResourceManager.prototype.deductEnergy = function(energy) {
  this.energy -= energy;
}

ResourceManager.prototype.canAffordBuildingEnergyCost = function(building) {
  return building.energyCost >= this.energy;
}

ResourceManager.prototype.canAffordBuildingMatterCost = function(building) {
  return building.matterCost >= this.matter;
}

ResourceManager.prototype.isEnergyOver = function(energyNeeded) {
  return this.energy > energyNeeded;
}

ResourceManager.prototype.buildSlotAvailable = function() {
  return this.constructionManager.enoughEmptyBuildSlots()
}

// CONSTRUCTION MANAGER CLASS:

function ConstructionManager(buildings) {
  this.buildings = buildings;
  this.buildingsUnderConstruction = [];
  this.buildAllowances = 1;
}

ConstructionManager.prototype.enoughEmptyBuildSlots = function() {
  return this.buildingsUnderConstruction.length < this.buildAllowances;
}

ConstructionManager.prototype.setBuildAllowances = function() {
  this.buildAllowances = this.buildings.filter(function(building) { return building.name === "Build Slot" && building.completed }).length + 1;
}

ConstructionManager.prototype.push = function(building) {
  if (this.enoughEmptyBuildSlots()) {
    this.buildingsUnderConstruction.push(building);
  }
}

ConstructionManager.prototype.continueBuildingAll = function(matter, energy) {
  var matterSoFar = 0;
  var energySoFar = 0;
  for (var i = 0; i < this.buildingsUnderConstruction.length; i++) {
    var currentBuilding = this.buildingsUnderConstruction[i];
    if (this.canBuild(currentBuilding, matter, energy, matterSoFar, energySoFar)) {
      currentBuilding.continueBuilding();
    }
    matterSoFar += currentBuilding.matterToDeductPerCycle();
    energySoFar += currentBuilding.energyToDeductPerCycle();
  }
  this.checkForCompletedBuildings()
  return {matter: matterSoFar, energy: energySoFar};
}

ConstructionManager.prototype.energyCosts = function() {
  var sum = 0;
  for (var i = 0; i < this.buildingsUnderConstruction.length; i++) {
    sum += this.buildingsUnderConstruction[i].energyToDeductPerCycle();
  }
  return sum;
}

ConstructionManager.prototype.matterCosts = function() {
  var sum = 0;
  for (var i = 0; i < this.buildingsUnderConstruction.length; i++) {
    sum += this.buildingsUnderConstruction[i].matterToDeductPerCycle();
  }
  return sum;
}

ConstructionManager.prototype.canBuild = function(currentBuilding, matter, energy, matterSoFar, energySoFar) {
  return currentBuilding.energyToDeductPerCycle() < energy - energySoFar &&
  currentBuilding.matterToDeductPerCycle() < matter - matterSoFar;
}

ConstructionManager.prototype.checkForCompletedBuildings = function() {
  for (var i = this.buildingsUnderConstruction.length - 1; i >= 0; i--) {
    if (this.buildingsUnderConstruction[i].completed || this.buildingsUnderConstruction[i].isDestroyed()) {
      this.buildingsUnderConstruction.splice(i, 1);
    }
  }
}
