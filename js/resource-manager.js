function ResourceManager(collection, startingMatter, startingEnergy) {
  this.collection = collection;
  this.matter = startingMatter ? startingMatter : 0;
  this.energy = startingEnergy ? startingEnergy : 0;
  this.matterFlow = 0;
  this.energyFlow = 0;
}

ResourceManager.prototype.tick = function() {
  this.setCurrentFlow();
  this.adjustResources();
}

ResourceManager.prototype.setCurrentFlow = function() {
  var currentFlow = this.calculateCurrentFlow(this.collection);
  this.matterFlow = currentFlow.matterThisCycle;
  this.energyFlow = currentFlow.energyThisCycle;
}

ResourceManager.prototype.calculateCurrentFlow = function(collection) {
  var matterThisCycle = 0;
  var energyThisCycle = 0;
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].active) {
      matterThisCycle += collection[i].matterProduction;
      energyThisCycle += collection[i].energyProduction;
    }
  }
  return {matterThisCycle: matterThisCycle, energyThisCycle: energyThisCycle}
  // Or perhaps:
  // return collection.reduce(function(obj, element) {
  //   obj.matterThisCycle += element.matterProduction;
  //   obj.energyThisCycle += element.energyThisCycle;
  //   return obj;
  // }, {matterThisCycle: 0, energyThisCycle: 0});
}

ResourceManager.prototype.adjustResources = function() {
  this.matter += this.matterFlow;
  this.energy += this.energyFlow;
}

ResourceManager.prototype.deductConstructionCosts = function(building) {
  this.matter -= building.matterToDeductPerCycle();
  this.energy -= building.energyToDeductPerCycle();
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

