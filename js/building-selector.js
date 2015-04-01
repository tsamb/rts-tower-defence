var BuildingSelector = {}

BuildingSelector.getBuildingIdByKeyCode = function(keyCode) {
  var character = KeyCodeCharMap[keyCode]
  for (var i = 0; i < BuildingsList.length; i++) {
    if (BuildingsList[i].key === character) {
      return i;
    }
  }
}
