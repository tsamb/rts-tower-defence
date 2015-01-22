// Enemy model

function Enemy(options) {
  this.topLeftX = options.topLeftX;
  this.topLeftY = options.topLeftY;
  this.size = options.size;
  this.maxDamagePerHit = options.damage || 5;
  this.speed = options.speed || 1;
  this.isMoving = true;
  this.attackingBuilding = undefined;
}

Enemy.prototype.moveOrAttack = function(buildings) {
  for (var i = 0; i < buildings.length; i++) {
    if (this.collidesWith(buildings[i])) {
      // this.topLeftX = buildings[i].topLeftX * 20 + buildings[i].width
      this.isMoving = false;
      this.attack(buildings[i]);
    } else {
      this.move();
    }
  }
}

Enemy.prototype.collidesWith = function(building) {
  return (this.topLeftX < building.topLeftX * 20 + building.size.x * 20 + this.size &&
    this.topLeftX + this.size > building.topLeftX * 20 - this.size &&
    this.topLeftY < building.topLeftY * 20 + building.size.y * 20 + this.size &&
    this.topLeftY + this.size > building.topLeftY * 20 - this.size)
}

Enemy.prototype.move = function() {
  if (this.isMoving) {
    this.topLeftX -= Math.floor(Math.random() * this.speed) + 1;
  }
}

Enemy.prototype.attack = function(building) {
  var damage = Math.floor(Math.random() * this.maxDamagePerHit);
  building.inflictDamage(damage);
}
