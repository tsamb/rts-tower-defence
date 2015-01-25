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

Building.prototype.centerX = function() { // create a vector class and put this on its prototype
  return this.topLeftX + this.boardSizeX / 2 // currently duplicated on enemy and building classes
}

Building.prototype.centerY = function() { // create a vector class and put this on its prototype
  return this.topLeftY + this.boardSizeY / 2 // currently duplicated on enemy and building classes
}

Building.prototype.enemiesWithinRange = function(enemies) {
  var enemiesWithDistances = enemies.map(function(enemy){
    return {enemy: enemy, distance: enemy.distanceFrom(this)}
  }.bind(this))
  var enemiesInRange = enemiesWithDistances.filter(function(enemy) {
    return enemy.distance <= this.range
  }.bind(this))
  return enemiesInRange;
}

Building.prototype.closestEnemy = function(enemiesWithDistances) { // expecting an array of objects/tuples holding an enemy object and its distance from this building
  var min = {distance: Number.POSITIVE_INFINITY};
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i] < min) { min = enemies[i] }
  }
  return min.enemy
}
