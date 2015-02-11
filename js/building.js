// Building model

function Building(options, game) {
  this.game = game

  this.name = options.name;
  this.maxHp = options.hp;
  this.hp = this.maxHp;
  this.range = options.range;
  this.damagePerShot = options.damagePerShot; // TKTKTK: remove energy per shot fired; no default because not all buildings can inflict damage
  this.energyPerShot = options.energyPerShot;

  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
  this.size = options.size;
  this.color = options.color;
  this.active = options.active || false; // won't produce resources or benefits until true
  this.sizeOnBoardX = undefined;
  this.sizeOnBoardY = undefined;
  this.position = new Vector();
  this.center = new Vector()
}

Building.prototype.setPosition = function(x,y) {
  this.position.x = x;
  this.position.y = y;
}

Building.prototype.setBoardSize = function(gridSize) {
  this.sizeOnBoardX = this.size.x * gridSize;
  this.sizeOnBoardY = this.size.y * gridSize;
  this.center.x = this.centerX() // TKTKTK: clean this up and put it somewhere else.
  this.center.y = this.centerY() // It just needs to go after sizeOnBoardX and Y exist.
}

Building.prototype.receiveDamage = function(damage) {
  this.hp -= damage;
}

Building.prototype.isDestroyed = function() {
  return this.hp <= 0;
}

Building.prototype.centerX = function() { // can this move to the Vector class?
  return this.position.x + this.sizeOnBoardX / 2 // currently duplicated on enemy and building classes
}

Building.prototype.centerY = function() { // can this move to the Vector class?
  return this.position.y + this.sizeOnBoardY / 2 // currently duplicated on enemy and building classes
}

Building.prototype.enemiesWithinRange = function(enemies) {
  var enemiesWithDistances = enemies.map(function(enemy){
    return {enemy: enemy, distance: enemy.distanceFrom(this)}
  }, this)
  var enemiesInRange = enemiesWithDistances.filter(function(enemy) {
    return enemy.distance <= this.range
  }, this)
  return enemiesInRange;
}

Building.prototype.closestEnemy = function(enemiesWithDistances) { // expecting an array of objects/tuples holding an enemy object and its distance from this building
  var min = {distance: Number.POSITIVE_INFINITY};
  for (var i = 0; i < enemiesWithDistances.length; i++) {
    if (enemiesWithDistances[i].distance < min.distance) { min = enemiesWithDistances[i] }
  }
  return min.enemy
}

Building.prototype.fireAt = function(enemies) {
  if (this.game.hasEnergyInSurplusOf(this.energyPerShot)) {
    var enemiesInRange = this.enemiesWithinRange(enemies);
    if (enemiesInRange[0]) {
      var closestEnemy = this.closestEnemy(enemiesInRange);
      var damage = this.damagePerShot // Math.floor(Math.random() * this.damagePerShot);
      this.game.deductEnergy(this.energyPerShot);
      this.game.board.drawLaser(this.centerX(), this.centerY(), closestEnemy.centerX(), closestEnemy.centerY());
      closestEnemy.receiveDamage(damage);
    }
  }
}

