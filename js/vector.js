function Vector(x, y) {
  this.x = x;
  this.y = arguments.length === 1 ? x : y;
}

Vector.prototype.add = function(addedVector) {
  return new Vector(this.x + addedVector.x, this.y + addedVector.y);
};

Vector.prototype.addInPlace = function(addedVector) {
  this.x += addedVector.x;
  this.y += addedVector.y;
};

Vector.prototype.times = function(factor)  {
  return new Vector(this.x * factor, this.y * factor);
};

Vector.prototype.distanceFrom = function(targetVector) {
  var squaredX = Math.pow(this.x - targetVector.x, 2);
  var squaredY = Math.pow(this.y - targetVector.x, 2);
  return Math.sqrt(squaredX + squaredY);
};

Vector.prototype.randomScale = function(minFactor, maxFactor) {
  var factor = Math.random() * (maxFactor - minFactor) + minFactor;
  return this.times(factor);
};
