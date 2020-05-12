describe("Initial startup", () => {
  it("open window", function () {
    return this.app.client
      .waitUntilWindowLoaded()
      .getWindowCount()
      .should.eventually.equal(1);
  });
});
