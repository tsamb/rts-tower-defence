// View

var View = (function() {
  View = {};
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

  View.enablePauseButton = function() {
    $("#pause").on("click", function() {alert("Game Paused.")});
  }

  View.appendCanvas = function(width, height) {
    return $("<canvas id='canvas' width='" + width + "' height='" + height + "'></canvas>").appendTo("#main-container")[0];
  }

  View.prependBuildingButtons = function(buildingsList) {
    for (var i = 0; i < buildingsList.length; i++) {
      $("#build-menu").prepend(this.buildingsTemplate(buildingsList[i], i));
    }
  }

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
