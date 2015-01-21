// Enemy model

function Enemy(options) {
  this.topLeftX = options.topLeftX;
  this.topLeftY = options.topLeftY;
  this.size = options.size;
  this.speed = options.speed || 15
}

Enemy.prototype.move = function() {
  this.topLeftX -= Math.floor(Math.random() * this.speed) + 5;
}
