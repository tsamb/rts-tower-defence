function Vector(x, y) {
  this.x = x;
  // with only one argument passed, that becomes x and y
  arguments.length > 1 ? this.y = y : this.y = x;
}
