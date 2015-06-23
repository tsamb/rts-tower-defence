var BuildingsList = [
  {
    name: "Command Center",
    hp: 3000,
    matterCost: 5000,
    energyCost: 50000,
    matterProduction: 2,
    energyProduction: 25,
    buildTime: 1000,
    benefit: "Your home base",
    size: {x:4, y:4},
    color: "#060",
    active: true,
    preBuilt: true,
    buildable: false,
    key: "c"
  },
  {
    name: "Matter Mine",
    hp: 200,
    matterCost: 50,
    energyCost: 520,
    matterProduction: 2,
    energyProduction: -5,
    // buildTime: 18,
    buildTime: 4,
    benefit: "+2 matter / t",
    size: {x:2, y:2},
    color: "#699",
    buildable: true,
    key: "m"
  },
  {
    name: "Solar Power Plant",
    hp: 100,
    matterCost: 150,
    energyCost: 800,
    matterProduction: 0,
    energyProduction: 20,
    // buildTime: 24,
    buildTime: 5,
    benefit: "+20 energy / t",
    size: {x:2, y:2},
    color: "#FF6",
    buildable: true,
    key: "s"
  },
  {
    name: "Laser Tower",
    hp: 500,
    matterCost: 150,
    energyCost: 800,
    matterProduction: 0,
    energyProduction: 0,
    energyPerShot: 200,
    damagePerShot: 50,
    range: 100,
    fireTime: 1,
    // buildTime: 40,
    buildTime: 10,
    benefit: "50 damage per shot",
    size: {x:1, y:1},
    color: "#F00",
    buildable: true,
    key: "l"
  },
  {
    name: "Barricade",
    hp: 1000,
    matterCost: 100,
    energyCost: 100,
    matterProduction: 0,
    energyProduction: 0,
    buildTime: 10,
    benefit: "A defensive wall",
    size: {x:1, y:1},
    color: "#555",
    buildable: true,
    key: "b"
  },
  { // WIP -> eventually buildable
    name: "Build Slot",
    hp: 100,
    matterCost: 1000,
    energyCost: 5000,
    matterProduction: -5,
    energyProduction: -10,
    buildTime: 50,
    benefit: "build more at once",
    size: {x:1, y:1},
    color: "#060",
    buildable: false,
    key: "s"
  }
];

var BaseEnemies = {
  normal: {
    size: 10,
    speed: 2,
    hp: 50,
    damage: 5
  },
  gargantuan: {
    size: 20,
    speed: 0.5,
    hp: 200,
    damage: 20
  },
  zerg: {
    size: 5,
    speed: 4,
    hp: 10,
    damage: 1
  }
}

var GameOptions = {
  STARTING_MATTER: 1000,
  STARTING_ENERGY: 5000,
  COMMAND_CENTER: new Building(BuildingsList[0])
};

var KeyCodeCharMap = {
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  65: 'a',
  66: 'b',
  67: 'c',
  68: 'd',
  69: 'e',
  70: 'f',
  71: 'g',
  72: 'h',
  73: 'i',
  74: 'j',
  75: 'k',
  76: 'l',
  77: 'm',
  78: 'n',
  79: 'o',
  80: 'p',
  81: 'q',
  82: 'r',
  83: 's',
  84: 't',
  85: 'u',
  86: 'v',
  87: 'w',
  88: 'x',
  89: 'y',
  90: 'z'
};
