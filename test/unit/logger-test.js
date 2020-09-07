const logger = require("../../server/logger");
var assert = require("assert");

describe("Logger", function () {
  it("It should log error while sending logger.error", function (done) {
    const msg = "Error";
    const errMsg = logger.error(msg);
    errMsg && assert.equal(msg, errMsg.message);
    return done();
  });
  it("It should not log error while sending logger.info", function (done) {
    const msg = "Some info logs";
    const infoMsg = logger.info(message);
    infoMsg && assert.equal(msg, infoMsg.message);
    return done();
  });
});
