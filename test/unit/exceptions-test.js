var assert = require("assert");
const {NotFoundException} = require('../../server/exceptions');

describe('NotFoundException', function() {
  it("has a status of 404", function() {
    const exception = new NotFoundException("This is not found");
    assert.equal(404, exception.httpStatusCode);
  })
});
