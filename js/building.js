// Building model

function Building(options) {
  this.name = options.name;
  this.hp = options.hp;
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

Building.prototype.inflictDamage = function(damage) {
  this.hp -= damage;
}
