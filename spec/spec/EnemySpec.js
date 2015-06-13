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

  describe("instance methods", function() {
    var noBuildings, fakeBuilding, buildings, nonCollidingBuildings, buildingsWithCollisionsInMiddle

    beforeEach(function() {
      noBuildings = [];

      fakeBuilding = jasmine.createSpyObj('building', ['receiveDamage', 'isDestroyed']);
      fakeBuilding.position = {x: 300, y: 300};
      fakeBuilding.sizeOnBoardX = 80;
      fakeBuilding.sizeOnBoardY = 80;

      secondFakeBuilding = jasmine.createSpyObj('building', ['receiveDamage', 'isDestroyed']);
      secondFakeBuilding.position = {x: 100, y: 100};
      secondFakeBuilding.sizeOnBoardX = 40;
      secondFakeBuilding.sizeOnBoardY = 40;

      thirdFakeBuilding = jasmine.createSpyObj('building', ['receiveDamage', 'isDestroyed']);
      thirdFakeBuilding.position = {x: 40, y: 120};
      thirdFakeBuilding.sizeOnBoardX = 20;
      thirdFakeBuilding.sizeOnBoardY = 20;

      buildings = [fakeBuilding];
      nonCollidingBuildings = [secondFakeBuilding];
      buildingsWithCollisionsInMiddle = [thirdFakeBuilding, fakeBuilding, secondFakeBuilding];

      spyOn(enemy, 'collidesWith').and.callThrough();
    });

    describe("#setDirection", function() {
      it("sets the direction of the Enemy", function(){
        expect(enemy.setDirection(enemy.position, enemy.target.center).x).toEqual(-0.7071067811865475);
        expect(enemy.setDirection(enemy.position, enemy.target.center).y).toEqual(-0.7071067811865475);
      });
    });

    describe("#moveOrAttack", function() {
      beforeEach(function() {
        spyOn(enemy, 'attack');
      });

      describe("when the enemy is not colliding with a building", function() {
        it("changes the the enemy's position", function(){
          enemy.moveOrAttack(noBuildings);
          expect(enemy.position.x).not.toEqual(300);
          expect(enemy.position.y).not.toEqual(300);
        });
      });

      describe("when the enemy is colliding with a building", function() {
        it("does not change the enemy's position if it has a building to attack", function() {
          enemy.moveOrAttack(buildings);
          expect(enemy.position.x).toEqual(300);
          expect(enemy.position.y).toEqual(300);
        });

        it("attacks the building if it has a building to attack", function() {
          enemy.moveOrAttack(buildings);
          expect(enemy.attack).toHaveBeenCalledWith(fakeBuilding);
        });
      });
    });

    describe("#checkForCollisions", function() {
      describe("when this enemy collides with a building", function() {
        it("turns off the isMoving flag when enemy collides with a building", function() {
          expect(enemy.isMoving).toEqual(true);
          enemy.checkForCollisions(buildings);
          expect(enemy.isMoving).toEqual(false);
        });

        it("sets the attackingBuilding attribute to the building with which the enemy collides", function() {
          expect(enemy.attackingBuilding).toEqual(undefined);
          enemy.checkForCollisions(buildings);
          expect(enemy.attackingBuilding).toEqual(fakeBuilding);
        });

        it("breaks out of the checking loop as soon as a collision is found", function() {
          enemy.checkForCollisions(buildingsWithCollisionsInMiddle);
          expect(enemy.collidesWith.calls.count()).toEqual(2)
        });
      });

      describe("when this enemy collides with no buildings", function() {
        it("leaves the isMoving flag as true", function() {
          enemy.checkForCollisions(nonCollidingBuildings);
          expect(enemy.isMoving).toEqual(true);
        });

        it("leaves the attackingBuilding attribute undefined", function() {
          enemy.checkForCollisions(nonCollidingBuildings);
          expect(enemy.attackingBuilding).toEqual(undefined);
        });
      });

    });

    describe("#collidesWith", function() {
      it("returns true when it overlaps with a building", function() {
        expect(enemy.collidesWith(fakeBuilding)).toEqual(true);
      });

      it("returns false when it does overlap with a building", function() {
        expect(enemy.collidesWith(secondFakeBuilding)).toEqual(false);
      });
    });

    describe("#move", function() {
      it("changes the position of enemy", function() {
        var oldPosition = JSON.stringify(enemy.position);
        enemy.move()
        expect(JSON.stringify(enemy.position)).not.toEqual(oldPosition);
      });
    });

    describe("#attack", function() {
      it("attacks the currently targeted building", function() {
        enemy.attack(fakeBuilding);
        expect(fakeBuilding.receiveDamage).toHaveBeenCalled();
      });

    });

    describe("#centerX", function() {

    });

    describe("#centerY", function() {

    });

    describe("#distanceFrom", function() {

    });

    describe("#receiveDamage", function() {

    });
  });
});
