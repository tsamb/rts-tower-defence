var game; // for development to access game object in browser

// Game logic
$(document).ready(function() {
  View.prependBuildingButtons(BuildingsList)
  View.enablePauseButton();
  game = new Game;
});
