var assert = require('assert');
const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({foo: "bar"})
  }
}

function createApp(loadData, route = {path: "/", pageType: "home-page"}) {
  const app = express();
  isomorphicRoutes(app, {
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null},
    getClient: getClientStub,
    generateRoutes: () => [route],
    loadData: loadData,
    appVersion: 42
  });

  return app;
}

describe('Isomorphic Data Load', function() {
  it("returns data given by the load data function", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({
      data: {
        pageType: pageType,
        config: config,
        clientHost: client.getHostname()
      }
    }));

    supertest(app)
      .get("/route-data.json?path=%2F")
      .expect("Content-Type", /json/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("home-page", response.data.pageType);
        assert.equal("bar", response.data.config.foo);
        assert.equal("demo.quintype.io", response.data.clientHost);
      }).then(done);
  });

  it("returns an appVersion on every response", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({}));

    supertest(app)
      .get("/route-data.json?path=%2F")
      .expect("Content-Type", /json/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal(42, response.appVersion);
      }).then(done);
  });

  it("return the title of the page", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({data: {}, title: "foobar"}));
    supertest(app)
      .get("/route-data.json?path=%2F")
      .expect("Content-Type", /json/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("foobar", response.title);
      }).then(done);
  });

  it("passes any params to the loadData function", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({data: {amazing: params.amazing}}), {pageType: "home-page", path: "/", params: {amazing: "stuff"}});
    supertest(app)
      .get("/route-data.json?path=%2F")
      .expect("Content-Type", /json/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("stuff", response.data.amazing);
      }).then(done);
  });

  it("passes back caching headers", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({data: {cacheKeys: ["foo", "bar"]}}));
    supertest(app)
      .get("/route-data.json?path=%2F")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", "public,max-age=15")
      .expect("Vary", "Accept-Encoding")
      .expect("Surrogate-Control", /public/)
      .expect("Surrogate-Key", "foo bar")
      .expect(200, done)
  })

  describe("status codes", function() {
    it("any status code more than 500 becomes an http 500", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {}, httpStatusCode: 503}));
      supertest(app)
        .get("/route-data.json?path=%2F")
        .expect("Content-Type", /json/)
        .expect(500, done);
    });

    it("any status code less than 500 becomes an http 200", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {}, httpStatusCode: 301}));
      supertest(app)
        .get("/route-data.json?path=%2F")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal(301, response.httpStatusCode);
        }).then(done);
    });
  });

  describe("failure scenarios", function(done) {
    it("returns 404 if the path is not matched", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {amazing: params.amazing}}), {pageType: "home-page", path: "/foobar"});
      supertest(app)
        .get("/route-data.json?path=%2F")
        .expect("Content-Type", /json/)
        .expect(404, done);
    });

    // it("returns 503 if loadData throws an exception", function(done) {
    //   const app = createApp((pageType, params, config, client) => {throw "foobar"});
    //   supertest(app)
    //     .get("/route-data.json?path=%2F")
    //     .expect("Content-Type", /json/)
    //     .expect(404, done);
    // });
  });
});
