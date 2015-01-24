// View

var View = (function() {
  View = {};

  // Event listeners

  View.setBuildListeners = function(buildingsList, game) {
    for (var i = 0; i < buildingsList.length; i++) {
      $("#new-building-" + i).on("click", null, i, game.build.bind(game));
    }
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

  View.displayResourceFlow = function(flow) {
    $("#net-matter-flow").text("Flow: " + flow.matter);
    $("#net-energy-flow").text("Flow: " + flow.energy);
  }

  View.updateBuildProgress = function(progress) {
    $("progress").attr("value", progress);
  }

  View.displayStatusMessage = function(message) {
    $("#status-message").text(message);
  }

  // DOM manipulation: append/show/hide

  View.appendCanvas = function(width, height) {
    return $("<canvas width='" + width + "' height='" + height + "'></canvas>").appendTo("#canvas-container")[0];
  }

  View.prependBuildingButtons = function(buildingsList) {
    for (var i = 0; i < buildingsList.length; i++) {
      $("#build-menu").prepend(this.buildingsTemplate(buildingsList[i], i));
    }
  }

  View.displayGameOver = function() {
    $("#game-over-message").show();
  }

  // HTML templates

  View.buildingsTemplate = function(building, buildingIndex) {
    var attrWhitelist = ["name", "hp", "matterCost", "energyCost", "benefit", "size"];
    var htmlString = "<div><table>";
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
