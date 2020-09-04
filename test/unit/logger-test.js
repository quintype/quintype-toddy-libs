const logger = require("../../server/logger");

describe("Logger", function () {
  it("It should log error while sending logger.error", function (done) {
    logger.error("Error");
    return done();
  });
  it("It should not log error while sending logger.info", function (done) {
    logger.info("Some info logs");
    return done();
  });
});
