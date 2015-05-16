describe("Enemy", function() {
  var enemy, args, startingHp, maxDamagePerHit;

  beforeEach(function() {
    startingHp = 200;
    maxDamagePerHit = 10;
    args = {
      topLeftX: 300,
      topLeftY: 300,
      hp: startingHp,
      damage: maxDamagePerHit,
      target: {center: {x: 100, y: 100}}} // mocking a command center and vector
    enemy = new Enemy(args);
  })

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
    expect(enemy.speed).not.toBeUndefined(); // rewrite so that we can pass in speed as an arg
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
})
