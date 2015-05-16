describe("Enemy", function() {
  var enemy, args, startingHp;

  beforeEach(function() {
    startingHp = 200;
    args = {
      topLeftX: 300,
      topLeftY: 300,
      hp: startingHp,
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
})
