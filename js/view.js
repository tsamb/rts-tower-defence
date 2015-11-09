var View = (function() {
  return {

    init: function() {
      this.renderBuildingButtons(BuildingsList);
      this.enablePauseButton();
    },

    ///// Event listeners /////

    setBuildListeners: function(buildingsList, game) {
      this.setBuildKeyListeners(buildingsList, game);
      for (var i = 0; i < buildingsList.length; i++) {
        $(".building-container").on("click", "#new-building-" + i, i, game.chooseBuilding.bind(game));
      }
    },

    setBuildKeyListeners: function(buildingsList, game) {
      $(document).keyup(game.chooseBuildingFromKey.bind(game));
    },

    setCanvasClickListeners: function(board) {
      $("canvas").on("click", board.handleClicks.bind(board));
    },

    enablePauseButton: function() {
      $("#pause").on("click", function() {alert("Game Paused."); });
    },

    ///// DOM manipulation: updates /////

    updateTimer: function(seconds) {
      $("#timer").text(seconds);
    },

    displayResources: function(resources) {
      $("#matter-display").text("Matter: " + resources.matter);
      $("#energy-display").text("Energy: " + resources.energy);
      $("#net-matter-flow").text("MATTER | income: " + resources.matterIncome + " | expenses: " + resources.matterExpenses);
      $("#net-energy-flow").text("ENERGY | income: " + resources.energyIncome + " | expenses: " + resources.energyExpenses);
    },

    displayStatusMessage: function(message) {
      var para = "<p>" + message + "</p>"
      $(para).prependTo("#status-messages").hide().slideDown();
    },

    updateScore: function(enemies, buildings)  {
      $("#enemies-destroyed").text(enemies);
      $("#buildings-destroyed").text(buildings);
    },

    ///// DOM manipulation: append/show/hide /////

    appendCanvas: function(width, height) {
      return $("<canvas width='" + width + "' height='" + height + "'></canvas>").appendTo("#canvas-container")[0];
    },

    renderBuildingButtons: function(buildingsList) {
      for (var i = 0; i < buildingsList.length; i++) {
        if (buildingsList[i].buildable) {
          $("#build-menu").append(this.buildingsTemplate(buildingsList[i], i));
        }
      }
    },

    displayGameOver: function(enemyStats, buildingStats, time) {
      var gameOverMessage = "<p>You destroyed " + enemyStats.numDestroyed + " enemies and dealt " + enemyStats.totalDamageDealt + " total damage.</p>" +
                            "<p>Enemies destroyed " + buildingStats.numDestroyed + " of your buildings and dealt " + buildingStats.totalDamageDealt + " total damage.</p>" +
                            "<p>You survived for " + time + " seconds.</p>";
      $("#game-over-message").append(gameOverMessage);
      $("#game-over-message").show();
    },

    ///// DOM manipulation: highlighting/user feedback /////

    highlightBuildingByElement: function(element) {
      this.deselectBuilding();
      $(element).addClass("selected-building");
    },

    highlightBuildingById: function(id) {
      this.deselectBuilding();
      $("#building-container-" + id).addClass("selected-building");
    },

    deselectBuilding: function() {
      $(".building-container").removeClass("selected-building");
    },

    ///// HTML templates /////

    buildingsTemplate: function(building, buildingIndex) {
      var attrWhitelist = ["name", "matterCost", "energyCost", "size"];
      var htmlString = "<div class='building-container' id='building-container-" + buildingIndex + "'><table>";
      for (var attr in building) {
        if (attrWhitelist.indexOf(attr) >= 0) {
          htmlString += "<tr>";
          htmlString += "<td>" + attr + ": </td>";
          if (attr === "size") {
            htmlString += "<td>" + building[attr].x + " x " + building[attr].y + "</td>";
          } else {
            htmlString += "<td>" + building[attr] + "</td>";
          }
          htmlString += "</tr>";
        }
      }
      htmlString += "</table><button id='new-building-" + buildingIndex + "'>Build " + building.name + "</button></div>";
      return htmlString;
    }
  };
})();
