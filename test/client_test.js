var assert = require('assert');

const {getClientImpl} = require("../server/api-client-impl");

function ClientStub(hostname) {
  this.hostname = hostname;
}

describe('client', function() {
  describe('getClient', function() {
    it("returns a cachedSecondaryClient if present", function() {
      const expectedClient = new ClientStub("foo.staging.quintype.io")
      const client = getClientImpl({}, {"foo.com": expectedClient}, ClientStub, "foo.com");
      assert.equal(expectedClient, client);
    });

    it('creates a temporary client if it matches a string', function() {
      const client = getClientImpl({host_to_automatic_api_host: ["-web"]}, {}, ClientStub, "foo-web.staging.quintype.io");
      assert.equal("https://foo.staging.quintype.io", client.hostname);
    });

    it("returns null if no client is found", function() {
      const client = getClientImpl({host_to_automatic_api_host: ["-web"]}, {}, ClientStub, "www.unknown.com");
      assert.equal(null, client);
    })
  });
});
