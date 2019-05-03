var assert = require('assert');
const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({"publisher-name": "madrid", "publisher-settings": {title: "Madrid"}})
  }
}

describe('AssetLink Handler', function() {
  const app = express();
  isomorphicRoutes(app, {
    assetHelper: {},
    getClient: getClientStub,
    assetLinkFn: (config) => Promise.resolve({
      packageName: `com.quintype.twa.${config["publisher-name"]}`,
      authorizedKeys: ["02:0F:1B:07:EE:20:66:36:74:76:1A:3E:BC:64:17:A7:7F:E3:EE:FE:E2:3A:6B:33:C1:4B:A8:24:69:D7:44:40"]
    }),
    publisherConfig: {},
  });

  it("returns a manifest", function(done) {
    supertest(app)
      .get("/.well-known/assetlinks.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect(200)
      .then(res => {
        const {relation, target} = JSON.parse(res.text)[0];
        assert.equal('delegate_permission/common.handle_all_urls', relation[0]);
        assert.equal('com.quintype.twa.madrid', target.package_name);
        assert.equal('02:0F:1B:07:EE:20:66:36:74:76:1A:3E:BC:64:17:A7:7F:E3:EE:FE:E2:3A:6B:33:C1:4B:A8:24:69:D7:44:40', target.sha256_cert_fingerprints[0]);
      }).then(done);
  });
});
