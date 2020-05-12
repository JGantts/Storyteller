describe("Launch CAOS Tool", function () {
  this.timeout(10000);
  
  it("should load the CAOS window when the button is pressed", async function () {
    await this.app.client.waitUntilWindowLoaded();

    await this.app.client.$("#nav-btn-dev").click();

    await this.app.client.$('#launch-caos').click();

    await this.app.client.switchWindow('CAOS Tool 2020');

    await this.app.client.close();

    this.app.client.getWindowCount().should.eventually.have.at.least(2);
  });
});
