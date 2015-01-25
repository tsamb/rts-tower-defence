// Building model

function Building(options) {
  this.name = options.name;
  this.hp = options.hp;
  this.range = options.range || 100;
  this.damage = options.damage || 20; // TKTKTK: remove energy per shot fired

  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
  this.size = options.size;
  this.color = options.color;
  this.active = options.active || false; // won't produce resources or benefits until true
  this.boardSizeX = undefined;
  this.boardSizeY = undefined;
  this.topLeftX = undefined;
  this.topLeftY = undefined;
}

Building.prototype.inflictDamage = function(damage) {
  this.hp -= damage;
}

Building.prototype.isDestroyed = function() {
  return this.hp <= 0;
}
