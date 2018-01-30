var assert = require('assert');
const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(logError, f, staticParams) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({foo: "bar"})
  }
}

function renderLayoutStub(res, params) {
  const content = JSON.stringify({
    content: params.content,
    store: params.store.getState()
  });
  return res.send(content);
}

describe('ShellHandler', function() {
  const app = express();
  isomorphicRoutes(app, {
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null},
    getClient: getClientStub,
    renderLayout: renderLayoutStub
  })

  it("returns the shell if the workbox prechaching matches", function(done) {
    supertest(app)
      .get("/shell.html?_workbox-precaching=abcdef")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const {content, store} = JSON.parse(res.text);
        assert.equal('<div class="app-loading"></div>', content);
        assert.equal("bar", store.qt.config.foo)
      }).then(done);
  });

  it("returns a 503 if the workbox precache doesn't match", function(done) {
    supertest(app)
      .get("/shell.html?_workbox-precaching=junk")
      .expect(503, done);
  });

  it("returns the shell if there is no workbox precaching", function(done) {
    supertest(app)
      .get("/shell.html")
      .expect("Content-Type", /html/)
      .expect(200, done);
  })
});
