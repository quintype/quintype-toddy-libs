var assert = require('assert');

const { Client } = require("quintype-backend")
const {getClientImpl} = require("../server/api-client-impl");

describe('client', function() {
  describe('getClient', function() {
    it("returns a cachedSecondaryClient if present", function() {
      const expectedClient = new Client("foo.staging.quintype.io", true)
      const client = getClientImpl({}, {"foo.com": expectedClient}, "foo.com");
      assert.equal(expectedClient, client);
    });

    it('creates a temporary client if it matches a string', function() {
      const client = getClientImpl({host_to_automatic_api_host: ["-web"]}, {}, "foo-web.staging.quintype.io");
      assert.equal("https://foo.staging.quintype.io", client.baseUrl);
    });

    it('creates a temporary client if it matches a string with a .', function() {
      const client = getClientImpl({host_to_automatic_api_host: [".madrid"]}, {}, "foo.madrid.quintype.io");
      assert.equal("https://foo.quintype.io", client.baseUrl);
    });

    it("returns null if no client is found", function() {
      const client = getClientImpl({host_to_automatic_api_host: ["-web"]}, {}, "www.unknown.com");
      assert.equal(null, client);
    })
  });
});
