var assert = require('assert');
const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({"publisher-settings": {title: "Madrid"}})
  }
}

describe('ManifestHandler', function() {
  const app = express();
  isomorphicRoutes(app, {
    assetHelper: {},
    getClient: getClientStub,
    manifestFn: (config) => Promise.resolve({
      foo: "bar"
    }), 
    publisherConfig: {},
  });

  it("returns a manifest", function(done) {
    supertest(app)
      .get("/manifest.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect(200)
      .then(res => {
        const {name, foo} = JSON.parse(res.text);
        assert.equal('Madrid', name);
        assert.equal("bar", foo);
      }).then(done);
  });
});
