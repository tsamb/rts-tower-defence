// View

var View = (function() {
  View = {};

  // Event listeners

  View.setBuildListeners = function(buildingsList, game) {
    this.setBuildKeyListeners(buildingsList, game);
    for (var i = 0; i < buildingsList.length; i++) {
      $(".building-container").on("click", "#new-building-" + i, i, game.chooseBuilding.bind(game));
    }
  }

  View.setBuildKeyListeners = function(buildingsList, game) {
    $(document).keyup(game.chooseBuildingFromKey.bind(game))
  }

  View.setCanvasClickListeners = function(board) {
    $("canvas").on("click", board.handleClicks.bind(board));
  }

  View.enablePauseButton = function() {
    $("#pause").on("click", function() {alert("Game Paused.")});
  }

  // DOM manipulation: updates

  View.updateTimer = function(seconds) {
    $("#timer").text(seconds);
  }

  View.displayResources = function(resources) {
    $("#matter-display").text("Matter: " + resources.matter);
    $("#energy-display").text("Energy: " + resources.energy);
  }

  View.displayResourceFlow = function(flow, constructionCosts) {
    $("#net-matter-flow").text("Producing: " + flow.matter + ". Consuming: " + constructionCosts.matter.toFixed(2));
    $("#net-energy-flow").text("Producing: " + flow.energy + ". Consuming: " + constructionCosts.energy.toFixed(2));
  }

  View.updateBuildProgress = function(progress) {
    $("progress").attr("value", progress);
  }

  View.displayStatusMessage = function(message) {
    $("#status-message").text(message);
  }

  View.updateScore = function(enemies, buildings)  {
    $("#enemies-destroyed").text(enemies);
    $("#buildings-destroyed").text(buildings);
  }

  // DOM manipulation: append/show/hide

  View.appendCanvas = function(width, height) {
    return $("<canvas width='" + width + "' height='" + height + "'></canvas>").appendTo("#canvas-container")[0];
  }

  View.prependBuildingButtons = function(buildingsList) {
    for (var i = 0; i < buildingsList.length; i++) {
      if (buildingsList[i].buildable) {
        $("#build-menu").append(this.buildingsTemplate(buildingsList[i], i));
      }
    }
  }

  View.displayGameOver = function(enemyStats, buildingStats, time) {
    $("#game-over-message").append("<p>You destroyed " + enemyStats.numDestroyed + " enemies and dealt " + enemyStats.totalDamageDealt + " total damage.</p>")
    $("#game-over-message").append("<p>Enemies destroyed " + buildingStats.numDestroyed + " of your buildings and dealt " + buildingStats.totalDamageDealt + " total damage.</p>")
    $("#game-over-message").append("<p>You survived for " + time + " seconds.</p>")
    $("#game-over-message").show();
  }

  // DOM manipulation: highlighting/user feedback

  View.highlightBuildingByElement = function(element) {
    this.deselectBuilding();
    $(element).addClass("selected-building");
  }

  View.highlightBuildingById = function(id) {
    this.deselectBuilding();
    $("#building-container-" + id).addClass("selected-building");
  }

  View.deselectBuilding = function() {
    $(".building-container").removeClass("selected-building");
  }

  // HTML templates

  View.buildingsTemplate = function(building, buildingIndex) {
    var attrWhitelist = ["name", "hp", "matterCost", "energyCost", "benefit", "size"];
    var htmlString = "<div class='building-container' id='building-container-" + buildingIndex + "'><table>";
    for (attr in building) {
      if (attrWhitelist.indexOf(attr) >= 0) {
        htmlString += "<tr>"
        htmlString += "<td>" + attr + ": </td>"
        if (attr === "size") {
          htmlString += "<td>" + building[attr].x + " x " + building[attr].y + "</td>"
        } else {
          htmlString += "<td>" + building[attr] + "</td>"
        }
        htmlString += "</tr>"
      }
    }
    htmlString += "</table><button id='new-building-" + buildingIndex + "'>Build " + building.name + "</button></div>"
    return htmlString
  }
  return View;
})();
