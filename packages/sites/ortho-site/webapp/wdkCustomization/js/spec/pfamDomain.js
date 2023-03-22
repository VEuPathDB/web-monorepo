describe("eupathdb.pfamDomain", function() {

  describe("PfamManager", function() {

    var manager = new eupathdb.pfamDomain.PfamManager();

    describe("assignColors", function() {
      var colors1, colors2;

      beforeEach(function() {
        colors1 = manager.assignColors("PF1232");
        colors2 = manager.assignColors("PF1232");
      });

      it ("returns an array", function() {
        expect(colors1 instanceof Array).toBe(true);
      });

      it ("is consistent", function() {
        expect(colors1.length).toEqual(colors2.length);
        expect(colors1.join(",")).toEqual(colors2.join(","));
      });

    });

  });

});
