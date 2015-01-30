// Board model

function Board(options) {
  this.game = options.game // a reference to the game that encapsulates this board

  this.width = options.width || 800;
  this.height = options.height || 400;
  this.gridSize = options.gridSize || 20;
  this.canvas = View.appendCanvas(this.width, this.height);
  this.context = this.canvas.getContext('2d');
  this.needsUpdate = true;

  this.hpCanvas = View.appendCanvas(this.width, this.height);
  this.hpContext = this.hpCanvas.getContext('2d');

  this.enemyCanvas = View.appendCanvas(this.width, this.height);
  this.enemyContext = this.enemyCanvas.getContext('2d');

  this.internalStorage = this.buildInternalStorage();
  this.buildingToPlace = undefined;
  this.setClickListeners();
}

Board.prototype.setClickListeners = function() {
  View.setCanvasClickListeners(this);
}

Board.prototype.handleClicks = function(event) {
  if (this.buildingToPlace) {
    var potentialX = Math.floor(event.offsetX / this.gridSize) * this.gridSize;
    var potentialY = Math.floor(event.offsetY / this.gridSize) * this.gridSize;
     if (this.isGridAvailable(this.buildingToPlace, potentialX, potentialY)) {
      this.buildingToPlace.topLeftX = potentialX;
      this.buildingToPlace.topLeftY = potentialY;
      this.placeBuilding(this.buildingToPlace);
      this.resetBuildingOnGame();
     } else { View.displayStatusMessage("Cannot build on top of an existing building.") }
  }
}

Board.prototype.placeBuilding = function(building) {
  building.boardSizeX = building.size.x * this.gridSize;
  building.boardSizeY = building.size.y * this.gridSize;
  for(var x = (building.topLeftX / this.gridSize); x < (building.topLeftX / this.gridSize) + building.size.x; x++) {
    for(var y = (building.topLeftY / this.gridSize); y < (building.topLeftY / this.gridSize) + building.size.y; y++) {
      this.internalStorage[y][x] = building;
    }
  }
  this.drawBuilding(building);
  building.active = true; // produce resources now that user has successfully placed building
  this.buildingToPlace = undefined;
}

Board.prototype.resetBuildingOnGame = function() {
  this.game.currentBuildingComplete();
}

Board.prototype.isGridAvailable = function(building, clickedX, clickedY) {
  var isAvailable = true
  var xToCheck = Math.floor(clickedX / this.gridSize)
  var yToCheck = Math.floor(clickedY / this.gridSize)
  for(var x = xToCheck; x < xToCheck + building.size.x; x++) {
    for(var y = yToCheck; y < yToCheck + building.size.y; y++) {
      if (this.internalStorage[y][x]) { return false; }
    }
  }
  return isAvailable
}

Board.prototype.refreshEnemies = function(enemies) {
  this.placeAllEnemies(enemies);
}

Board.prototype.completeRefresh = function(buildings, enemies) {
  this.clearCanvas();
  this.clearInternalStorage();
  this.drawGrid();
  this.placeAllBuildings(buildings);
  this.needsUpdate = false;
}

Board.prototype.placeAllEnemies = function(enemies) {
  this.enemyContext.clearRect(0, 0, this.width, this.height);
  for (var i = 0; i < enemies.length; i++ ) {
    this.drawEnemy(enemies[i])
  }
}

Board.prototype.drawEnemy = function(enemy) {
  this.enemyContext.fillStyle = "#222"; // TKTKTK: store color on Enemy model
  this.enemyContext.fillRect(enemy.topLeftX - 5, enemy.topLeftY, enemy.size, enemy.size);
}

Board.prototype.clearCanvas = function() {
  this.context.clearRect(0, 0, this.width, this.height);
}

Board.prototype.drawGrid = function() {
  for (var x = -1; x <= this.width; x += this.gridSize) {
    this.context.moveTo(0.5 + x, 0);
    this.context.lineTo(0.5 + x, this.height);
  }
  for (var y = -1; y <= this.height; y += this.gridSize) {
    this.context.moveTo(0, 0.5 + y);
    this.context.lineTo(this.width, 0.5 + y);
  }
  this.context.strokeStyle = "#CCC";
  this.context.stroke();
}

Board.prototype.placeAllBuildings = function(buildings) {
  for (var i = 0; i < buildings.length; i++) {
    this.placeBuilding(buildings[i]);
  }
}

Board.prototype.drawBuilding = function(building) {
  this.context.fillStyle = building.color;
  this.context.fillRect(building.topLeftX, building.topLeftY, building.boardSizeX, building.boardSizeY);
}

Board.prototype.drawAllHp = function(buildings) {
  this.hpContext.clearRect(0, 0, this.width, this.height);
  for (var i = 0; i < buildings.length; i++) {
    this.drawHp(buildings[i]);
  }
}

Board.prototype.drawHp = function(building) {
  this.hpContext.fillStyle = "#EEE";
  this.hpContext.fillText(building.hp, (building.topLeftX) + 3, building.topLeftY + building.boardSizeY - 10);
}

Board.prototype.drawLaser = function(startingX, startingY, endingX, endingY) {
  this.enemyContext.beginPath(); // refactor onto a laser lines canvas
  this.enemyContext.moveTo(startingX, startingY);
  this.enemyContext.lineTo(endingX, endingY);
  this.enemyContext.lineWidth = 2;
  this.enemyContext.strokeStyle = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  this.enemyContext.stroke();
}

Board.prototype.clearInternalStorage = function() {
  this.internalStorage = this.buildInternalStorage();
}

Board.prototype.buildInternalStorage = function() {
  var cols = this.width/this.gridSize;
  var rows = this.height/this.gridSize;
  var grid = [];
  for (var x = 0; x < rows; x++) {
    grid.push([]);
    for (var y = 0; y < cols; y++) {
      grid[x].push("");
    }
  }
  return grid;
}
