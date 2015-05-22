describe("Enemy", function() {
  var enemy, args, speed, startingHp, maxDamagePerHit;

  beforeEach(function() {
    speed = 10;
    startingHp = 200;
    maxDamagePerHit = 10;
    args = {
      topLeftX: 300,
      topLeftY: 300,
      speed: speed,
      hp: startingHp,
      damage: maxDamagePerHit,
      target: {center: new Vector(100)}}
    enemy = new Enemy(args);
  })

  describe("attributes at initialize", function() {
    it("has an HP attribute", function() {
      expect(enemy.hp).not.toBeUndefined();
    });

    it("sets its HP attribute to the argument passed to it", function() {
      expect(enemy.hp).toEqual(startingHp);
    });

    it("defaults to 100 HP when no HP attribute is passed", function() {
      var noHpArgEnemy = new Enemy({ topLeftX: 300, topLeftY: 300, target: {center: {x: 100, y: 100}}});
      expect(noHpArgEnemy.hp).toEqual(100);
    });

    it("has a speed attribute", function() {
      expect(enemy.speed).not.toBeUndefined();
    });

    it("sets its speed attribute to the argument passed to it", function() {
      expect(enemy.speed).toEqual(speed);
    });

    it("defaults to speed of 3 when no speed attribute is passed", function() {
      var noSpeedArgEnemy = new Enemy({ topLeftX: 300, topLeftY: 300, target: {center: {x: 100, y: 100}}});
      expect(noSpeedArgEnemy.speed).toEqual(3);
    });

    it("has a max damage per hit attribute", function() {
      expect(enemy.maxDamagePerHit).not.toBeUndefined();
    });

    it("sets its max damage per hit attribute to the argument passed to it", function() {
      expect(enemy.maxDamagePerHit).toEqual(maxDamagePerHit);
    });

    it("defaults to 5 max damage when no damage attribute is passed", function() {
      var noDamageArgEnemy = new Enemy({ topLeftX: 300, topLeftY: 300, target: {center: {x: 100, y: 100}}});
      expect(noDamageArgEnemy.maxDamagePerHit).toEqual(5);
    });

    it("has an 'is moving' attribute", function() {
      expect(enemy.isMoving).not.toBeUndefined();
    });

    it("is moving by default", function() {
      expect(enemy.isMoving).toEqual(true);
    });

    it("has a position attribute", function() {
      expect(enemy.position).not.toBeUndefined();
    });

    it("has a Vector object as its position attribute", function() {
      expect(enemy.position).toEqual(jasmine.any(Vector));
    });

    it("has a size attribute", function() {
      expect(enemy.size).not.toBeUndefined();
    });

    it("has a Vector object as its size attribute", function() {
      expect(enemy.size).toEqual(jasmine.any(Vector));
    });

    it("is not attacking any building by default", function() {
      expect(enemy.attackingBuilding).toBeUndefined();
    });

    it("has a target attribute", function() {
      expect(enemy.target).not.toBeUndefined();
    });

    it("has a direction attribute", function() {
      expect(enemy.direction).not.toBeUndefined();
    });

    it("has a Vector object as its direction attribute", function() {
      expect(enemy.direction).toEqual(jasmine.any(Vector));
    });
  });

  describe("setDirection", function() {
    it("sets the direction of the Enemy", function(){
      expect(enemy.setDirection(enemy.position, enemy.target.center).x).toEqual(-0.7071067811865475);
      expect(enemy.setDirection(enemy.position, enemy.target.center).y).toEqual(-0.7071067811865475);
    });
  });
});
