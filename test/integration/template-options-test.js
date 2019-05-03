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

describe('TemplateOptionsHandler', function() {
  it("returns the template options", function(done) {
    const app = express();
    isomorphicRoutes(app, {
      assetHelper: {},
      getClient: getClientStub,
      templateOptions: {name: "Madrid", foo: "bar"},
      publisherConfig: {},
    });

    supertest(app)
      .get("/template-options.json")
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

  it("does template options when passed in a function", function(done) {
    const app = express();
    isomorphicRoutes(app, {
      assetHelper: {},
      getClient: getClientStub,
      templateOptions: config => ({name: config["publisher-settings"].title}),
      publisherConfig: {},
    });

    supertest(app)
      .get("/template-options.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect(200)
      .then(res => {
        const {name, foo} = JSON.parse(res.text);
        assert.equal('Madrid', name);
      }).then(done);
  });
});
