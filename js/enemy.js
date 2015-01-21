// Enemy model

function Enemy(options) {
  this.topLeftX = options.topLeftX;
  this.topLeftY = options.topLeftY;
  this.size = options.size;
}

Enemy.prototype.move = function() {
  this.topLeftX -= 5;
}
