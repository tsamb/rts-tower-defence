// Enemy model

function Enemy(options) {
  this.topLeftX = options.topLeftX;
  this.topLeftY = options.topLeftY;
  this.size = options.size;
}

Enemy.prototype.move = function() {
  this.topLeftX -= Math.floor(Math.random() * 15) + 5; // TKTKTK: systematize this for different enemy types
}
