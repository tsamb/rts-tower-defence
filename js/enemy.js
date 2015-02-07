// Enemy model

function Enemy(options) {
  this.position = new Vector(options.topLeftX, options.topLeftY);
  this.size = new Vector(options.size);

  this.maxHp = options.hp || 100;
  this.hp = this.maxHp;
  this.maxDamagePerHit = options.damage || 5;
  this.speed = options.speed || 3;
  this.isMoving = true;
  this.attackingBuilding = undefined;
}

Enemy.prototype.moveOrAttack = function(buildings) {
  this.checkForCollisions(buildings);
  this.move();
  if (this.attackingBuilding) {
    this.attack(this.attackingBuilding);
  }
}

Enemy.prototype.checkForCollisions = function(buildings) {
  for (var i = 0; i < buildings.length; i++) {
    if (this.collidesWith(buildings[i])) {
      this.isMoving = false;
      this.attackingBuilding = buildings[i];
    }
  }
}

Enemy.prototype.collidesWith = function(building) {
  return (this.position.x < building.topLeftX + building.boardSizeX + this.size.x &&
    this.position.x + this.size.x > building.topLeftX - this.size.x &&
    this.position.y < building.topLeftY + building.boardSizeY + this.size.y &&
    this.position.y + this.size.y > building.topLeftY - this.size.y)
}

Enemy.prototype.move = function() {
  if (this.isMoving) {
    this.position.x -= Math.floor(Math.random() * this.speed) + 1;
  }
}

Enemy.prototype.attack = function(building) {
  var damage = Math.floor(Math.random() * this.maxDamagePerHit);
  building.receiveDamage(damage);
  if (building.isDestroyed()) {
    this.attackingBuilding = undefined;
    this.isMoving = true;
  }
}

Enemy.prototype.centerX = function() { // create a vector class and put this on its prototype
  return this.position.x + this.size.x / 2 // currently duplicated on enemy and building classes
}

Enemy.prototype.centerY = function() { // create a vector class and put this on its prototype
  return this.position.y + this.size.y / 2 // currently duplicated on enemy and building classes
}

Enemy.prototype.distanceFrom = function(object) {
  var squaredX = Math.pow(this.centerX() - object.centerX(), 2);
  var squaredY = Math.pow(this.centerY() - object.centerY(), 2);
  return Math.sqrt(squaredX + squaredY);
}

Enemy.prototype.receiveDamage = function(damage) {
  this.hp -= damage;
}

Enemy.prototype.isDestroyed = function() {
  return this.hp <= 0;
}
