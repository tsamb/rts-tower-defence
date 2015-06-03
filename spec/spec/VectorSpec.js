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

    it("returns the original vector", function() {
      expect(vector.addInPlace(simpleVector)).toEqual(vector);
    });

    it("adds the x and y attributes of one vector to another", function() {
      var expectedX = vector.x + simpleVector.x;
      var expectedY = vector.y + simpleVector.y;

      vector.addInPlace(simpleVector)

      expect(vector.x).toEqual(expectedX);
      expect(vector.y).toEqual(expectedY);
    });
  });

  describe("times", function() {
    var multipliedVector;

    beforeEach( function() {
      multipliedVector = vector.times(2);
    });

    it("returns a new vector", function() {
      expect(multipliedVector).toEqual(jasmine.any(Vector));
    });

    it("multiplies vector's attributes to create new vector", function() {
      expectedX = vector.x * 2;
      expectedY = vector.y * 2;

      expect(multipliedVector.x).toEqual(expectedX);
      expect(multipliedVector.y).toEqual(expectedY);
    });
  });

  describe("distanceFrom", function() {
    it("returns the distance between two vectors", function() {
      expect(vector.distanceFrom(simpleVector)).toEqual(Math.sqrt(18100));
    });
  });

  describe("randomScale", function() {
    var randomlyScaledVector;

    beforeEach( function() {
      spyOn(Math, "random").and.returnValue(0.1);
      spyOn(vector, "times").and.callThrough();
      randomlyScaledVector = vector.randomScale(1, 3);
    });

    it("returns a new vector", function() {
      expect(randomlyScaledVector).toEqual(jasmine.any(Vector));
    });

    it("calls the times function", function() {
      expect(vector.times).toHaveBeenCalled();
    });

    it("calls times with the appropriate factor argument", function() {
      expect(vector.times.calls.argsFor([0])).toEqual([1.2]);
    });
  });

  describe("directionTo", function() {
    var directionToVector;

    beforeEach( function() {
      spyOn(vector, "distanceFrom").and.callThrough();
      directionToVector = vector.directionTo(simpleVector);
    });

    it("returns a new vector", function() {
      expect(directionToVector).toEqual(jasmine.any(Vector));
    });

    it("calls distanceFrom twice", function() {
      expect(vector.distanceFrom.calls.count()).toEqual(2);
      expect(vector.distanceFrom.calls.allArgs()).toEqual([[simpleVector],[simpleVector]]);
    });

    it("returns a vector with the appropriate coordinates", function() {
      var expectedX = (-100) / Math.sqrt(18100);
      var expectedY = 90 / Math.sqrt(18100);

      expect(directionToVector.x).toEqual(expectedX);
      expect(directionToVector.y).toEqual(expectedY);
    });
  });
});
