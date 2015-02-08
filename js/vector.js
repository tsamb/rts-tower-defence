function Vector(x, y) {
  this.x = x;
  // with only one argument passed, that argument gets assinged to both x and y
  arguments.length > 1 ? this.y = y : this.y = x;
}

Vector.prototype.add = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(factor)  {
  return new Vector(this.x * factor, this.y * factor);
}

Vector.prototype.addInPlace = function(other) {
  this.x += other.x;
  this.y += other.y;
}

Vector.prototype.randomScale = function(minFactor, maxFactor) {
  var factor = Math.random() * (maxFactor - minFactor) + minFactor;
  return this.times(factor);
}
