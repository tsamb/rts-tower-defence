// Enemy model

function Enemy(options) {
  this.topLeftX = options.topLeftX;
  this.topLeftY = options.topLeftY;
  this.size = options.size;

  this.hp = options.hp || 10;
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
      // this.topLeftX = buildings[i].topLeftX * 20 + buildings[i].width
      this.isMoving = false;
      this.attackingBuilding = buildings[i];
    }
  }
}

Enemy.prototype.collidesWith = function(building) {
  return (this.topLeftX < building.topLeftX + building.boardSizeX + this.size &&
    this.topLeftX + this.size > building.topLeftX - this.size &&
    this.topLeftY < building.topLeftY + building.boardSizeY + this.size &&
    this.topLeftY + this.size > building.topLeftY - this.size)
}

Enemy.prototype.move = function() {
  if (this.isMoving) {
    this.topLeftX -= Math.floor(Math.random() * this.speed) + 1;
  }
}

Enemy.prototype.attack = function(building) {
  var damage = Math.floor(Math.random() * this.maxDamagePerHit);
  building.inflictDamage(damage);
  if (building.isDestroyed()) {
    this.attackingBuilding = undefined;
    this.isMoving = true;
  }
}
