var Enemy = (function() {
  var DEFAULT_ENEMY_SIZE = 10;

  var Enemy = function(options) {
    this.position = new Vector(options.topLeftX, options.topLeftY);
    this.size = new Vector(options.size || DEFAULT_ENEMY_SIZE);
    this.speed = options.speed || 3;

    this.maxHp = options.hp || 100;
    this.hp = this.maxHp;
    this.maxDamagePerHit = options.damage || 5;
    this.isMoving = true;
    this.attackingBuilding = undefined;

    this.target = options.target;
    this.direction = this.setDirection(this.position, this.target.center);
  }

  Enemy.prototype.setDirection = function(currentPosition, targetPosition) {
    return currentPosition.directionTo(targetPosition);
  };

  Enemy.prototype.moveOrAttack = function(buildings) {
    this.checkForCollisions(buildings);
    this.move();
    if (this.attackingBuilding) {
      this.attack(this.attackingBuilding);
    }
  };

  Enemy.prototype.checkForCollisions = function(buildings) {
    for (var i = 0; i < buildings.length; i++) {
      if (this.collidesWith(buildings[i])) {
        this.isMoving = false;
        this.attackingBuilding = buildings[i];
        return
      }
    }
  };

  Enemy.prototype.collidesWith = function(building) {
    return (this.position.x < building.position.x + building.sizeOnBoardX &&
      this.position.x + this.size.x > building.position.x &&
      this.position.y < building.position.y + building.sizeOnBoardY &&
      this.position.y + this.size.y > building.position.y);
  };

  Enemy.prototype.move = function() {
    if (this.isMoving) {
      this.position.addInPlace(this.direction.randomScale(this.speed / 2,this.speed));
    }
  };

  Enemy.prototype.attack = function(building) {
    var damage = Math.floor(Math.random() * this.maxDamagePerHit);
    building.receiveDamage(damage);
    if (building.isDestroyed()) {
      this.attackingBuilding = undefined;
      this.isMoving = true;
    }
  };

  // create a vector class and put this on its prototype
  // currently duplicated on enemy and building classes
  Enemy.prototype.centerX = function() {
    return this.position.x + this.size.x / 2;
  };
  Enemy.prototype.centerY = function() {
    return this.position.y + this.size.y / 2;
  };

  // TODO -> abstract this into Vector model
  // move CenterX and Y to Vector objects
  Enemy.prototype.distanceFrom = function(object) {
    var squaredX = Math.pow(this.centerX() - object.centerX(), 2);
    var squaredY = Math.pow(this.centerY() - object.centerY(), 2);
    return Math.sqrt(squaredX + squaredY);
  };

  Enemy.prototype.receiveDamage = function(damage) {
    this.hp -= damage;
  };

  Enemy.prototype.isDestroyed = function() {
    return this.hp <= 0;
  };

  return Enemy;
})()
