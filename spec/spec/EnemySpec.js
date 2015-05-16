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

  // it("has an HP attribute", function() {
  //   var enemy = new Enemy({maxHp: 100})
  //   expect(enemy.hp).toEqual(100);
  // });
})
