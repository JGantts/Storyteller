const testhelper = require("./spectron-helper");
const app = testhelper();
const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

global.before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

before(async function () {
  chaiAsPromised.transferPromiseness = app.transferPromiseness;
  
  this.app = app;
  await app.start();
});

after(async function () {
  if (app && app.isRunning()) {
    await app.stop();
  }
});
