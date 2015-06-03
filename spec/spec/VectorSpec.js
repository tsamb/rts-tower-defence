describe("Vector", function() {
  var vector, simpleVector;

  beforeEach( function() {
    vector = new Vector (200, 10);
    simpleVector = new Vector(100);
  })

  describe("attributes at initialize", function() {
    describe("when initialized with one arguments", function() {
      it("sets both attributes to the same value", function() {
        expect(simpleVector.x).toEqual(100);
        expect(simpleVector.y).toEqual(100);
      });
    });

    describe("when initialized with two arguments", function() {
      it("sets different x and y attributes", function() {
        expect(vector.x).toEqual(200);
        expect(vector.y).toEqual(10);
      });
    });
  });

  describe("add", function() {
    var addedVector;

    beforeEach( function() {
      addedVector = vector.add(simpleVector);
    });

    it("returns a new vector", function() {
      expect(addedVector).toEqual(jasmine.any(Vector));
    });

    it("adds two vectors' x and y attributes to create new vector", function() {
      var expectedX = vector.x + simpleVector.x;
      var expectedY = vector.y + simpleVector.y;

      expect(addedVector.x).toEqual(expectedX);
      expect(addedVector.y).toEqual(expectedY);
    });
  });

  describe("addInPlace", function() {

    it("returns undefined", function() {
      expect(vector.addInPlace(simpleVector)).toBeUndefined();
    });

    it("adds the x and y attributes of one vector to another", function() {
      var expectedX = vector.x + simpleVector.x;
      var expectedY = vector.y + simpleVector.y;

      vector.addInPlace(simpleVector)

      expect(vector.x).toEqual(expectedX);
      expect(vector.y).toEqual(expectedY);
    });
  });
});
