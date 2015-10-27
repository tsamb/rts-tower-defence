var FRAMES_PER_RUN = 5; // how often (in frames) the build loop runs
// the above line really needs to live in the game as a constant
// and be referenced by or injected into this class.
var ENEMY_LEVEL_MULTIPLIER_BASE = 1000; // (current level * this num) xp required for next level

function Building(options, game) {
  var options = options || {}
  this.game = game;

  this.name = options.name;
  this.maxHp = options.hp;
  this.hp = options.preBuilt ? this.maxHp : 1;
  this.completed = options.preBuilt ? true : false;

  this.range = options.range;
  this.damagePerShot = options.damagePerShot; // TODO -> remove energy per shot fired; no default because not all buildings can inflict damage
  this.energyPerShot = options.energyPerShot;
  this.xp = 0;
  this.level = 1;

  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
  this.size = options.size;
  this.color = options.color;
  this.active = options.active || false;
  this.sizeOnBoardX = undefined;
  this.sizeOnBoardY = undefined;
  this.position = new Vector();
  this.center = new Vector();
}

Building.prototype.setPosition = function(x,y) {
  this.position.x = x;
  this.position.y = y;
};

Building.prototype.setBoardSize = function(gridSize) {
  this.sizeOnBoardX = this.size.x * gridSize;
  this.sizeOnBoardY = this.size.y * gridSize;
  this.center.x = this.centerX(); // TODO -> clean this up and put it somewhere else.
  this.center.y = this.centerY(); // It just needs to go after sizeOnBoardX and Y exist.
};

Building.prototype.continueBuilding = function() {
  this.hp += this.hpBuildSpeed();
  if (this.hp >= this.maxHp) {
    this.completeConstruction();
  }
};

Building.prototype.completeConstruction = function() {
  this.hp = this.maxHp;
  this.completed = true;
  this.active = true;
};

Building.prototype.hpBuildSpeed = function() {
  return this.maxHp / (this.buildTime * FRAMES_PER_RUN);
};

Building.prototype.energyToDeductPerCycle = function() {
  return this.energyCost / (this.buildTime * FRAMES_PER_RUN);
};

Building.prototype.matterToDeductPerCycle = function() {
  return this.matterCost / (this.buildTime * FRAMES_PER_RUN);
};

Building.prototype.receiveDamage = function(damage) {
  this.hp -= damage;
};

Building.prototype.isDestroyed = function() {
  return this.hp <= 0;
};

// can this move to the Vector class?
// currently duplicated on enemy and building classes
Building.prototype.centerX = function() {
  return this.position.x + this.sizeOnBoardX / 2;
};
Building.prototype.centerY = function() {
  return this.position.y + this.sizeOnBoardY / 2;
};

Building.prototype.enemiesWithinRange = function(enemies) {
  var enemiesWithDistances = enemies.map(function(enemy){
    return {enemy: enemy, distance: enemy.distanceFrom(this)};
  }, this);
  var enemiesInRange = enemiesWithDistances.filter(function(enemy) {
    return enemy.distance <= this.range;
  }, this);
  return enemiesInRange;
};

Building.prototype.closestEnemy = function(enemiesWithDistances) { // expecting an array of objects/tuples holding an enemy object and its distance from this building
  var min = {distance: Number.POSITIVE_INFINITY};
  for (var i = 0; i < enemiesWithDistances.length; i++) {
    if (enemiesWithDistances[i].distance < min.distance) { min = enemiesWithDistances[i]; }
  }
  return min.enemy;
};

Building.prototype.fireAt = function(enemies) {
  if (this.game.hasEnergyInSurplusOf(this.energyPerShot) && this.active) {
    var enemiesInRange = this.enemiesWithinRange(enemies);
    if (enemiesInRange[0]) {
      var closestEnemy = this.closestEnemy(enemiesInRange);
      var damage = this.damagePerShot; // Math.floor(Math.random() * this.damagePerShot);
      this.game.deductEnergy(this.energyPerShot);
      this.game.board.drawLaser(this.centerX(), this.centerY(), closestEnemy.centerX(), closestEnemy.centerY());
      closestEnemy.receiveDamage(damage);
      if (closestEnemy.isDestroyed()) {
        this.increaseXpAndLevel(closestEnemy);
      }
    }
  }
};

Building.prototype.increaseXpAndLevel = function(enemy) {
  this.xp += enemy.maxHp;
  this.setLevel();
}

Building.prototype.setLevel = function() {
  if (this.xp >= ENEMY_LEVEL_MULTIPLIER_BASE * this.level) {
    this.level += 1
  }
}

///// Computed properties /////

Building.prototype.isPlaced = function() {
  return !!this.position.x;
};

Building.prototype.canFire = function() {
  return this.damagePerShot && this.isPlaced();
};


