// Board model

function Board(options) {
  this.width = options.width || 800;
  this.height = options.height || 400;
  this.gridSize = options.gridSize || 20;
  this.canvas = View.appendCanvas(this.width, this.height);
  this.context = this.canvas.getContext('2d');
  this.needsUpdate = true;

  this.enemyCanvas = View.appendCanvas(this.width, this.height);
  this.enemyContext = this.enemyCanvas.getContext('2d');

  this.internalStorage = Board.buildStorageGrid(this.width/20, this.height/20);
  this.buildingToPlace = undefined;
  this.setUpClickListeners();
}

Board.prototype.setUpClickListeners = function() {
  $("canvas").on("click", this.handleClicks.bind(this));
}

Board.prototype.handleClicks = function(event) {
  if (this.buildingToPlace) {
    var potentialX = Math.floor(event.offsetX / this.gridSize);
    var potentialY = Math.floor(event.offsetY / this.gridSize);
     if (this.isGridAvailable(this.buildingToPlace, potentialX, potentialY)) {
      this.buildingToPlace.topLeftX = potentialX;
      this.buildingToPlace.topLeftY = potentialY;
      this.placeBuilding(this.buildingToPlace);
     } else { View.displayStatusMessage("Cannot build on top of an existing building.") }
  }
}

Board.prototype.placeBuilding = function(building) {
  for(var x = building.topLeftX; x < building.topLeftX + building.size.x; x++) {
    for(var y = building.topLeftY; y < building.topLeftY + building.size.y; y++) {
      this.internalStorage[x][y] = new Cell(building, [building.topLeftX, building.topLeftY]);
    }
  }
  this.drawBuilding(building);
  building.active = true;
  this.buildingToPlace = undefined;
}

Board.prototype.isGridAvailable = function(building, xToCheck, yToCheck) {
  var isAvailable = true
  for(var x = xToCheck; x < xToCheck + building.size.x; x++) {
    for(var y = yToCheck; y < yToCheck + building.size.y; y++) {
      if (this.internalStorage[x][y]) { return false; }
    }
  }
  return isAvailable
}

Board.prototype.refreshEnemies = function(enemies) {
  this.placeAllEnemies(enemies);
}

Board.prototype.completeRefresh = function(buildings, enemies) {
  this.clearCanvas();
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
  this.context.fillRect(building.topLeftX * this.gridSize, building.topLeftY * this.gridSize, building.size.x * this.gridSize, building.size.y * this.gridSize);
}

Board.buildStorageGrid = function(rows, cols) {
  var grid = [];
  for (var x = 0; x < rows; x++) {
    grid.push([]);
    for (var y = 0; y < cols; y++) {
      grid[x].push("");
    }
  }
  return grid;
}

// Board Cell model

function Cell(building, topLeft) {
  this.building = building;
  this.topLeft = topLeft;
}
