function Vector(x, y) {
  this.x = x;
  // with only one argument passed, that becomes x and y
  arguments.length > 1 ? this.y = y : this.y = x;
}

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(factor)  {
  return new Vector(this.x * factor, this.y * factor);
}
