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

function createApp(loadData, staticRoutes, opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null},
    getClient: getClientStub,
    staticRoutes: staticRoutes,
    generateRoutes: () => [],
    loadData: loadData,
    renderLayout: (res, {store, disableAjaxNavigation, contentTemplate}) => res.send(JSON.stringify({store: store.getState(), contentTemplate, disableAjaxNavigation})),
    appVersion: 42,
    publisherConfig: {},
  }, opts));

  return app;
}

describe('Static Routes', function() {
  describe("route-data.json", function() {
    it("Loads the data for the static route", function(done) {
      const app = createApp((pageType, params, config, client, {host}) => Promise.resolve({data: {pageType, params, host}}), [{path: "/about-us", pageType: 'about-us', renderParams: {contentTemplate: "./about-us"}}]);

      supertest(app)
        .get("/route-data.json?path=%2Fabout-us")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal("about-us", response.data.pageType);
          assert.equal("127.0.0.1", response.data.host);
          assert.equal(true, response.disableIsomorphicComponent);
        }).then(done);
    });

    it("defaults the pageType to static-page", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {pageType, params}}), [{path: "/about-us", renderParams: {contentTemplate: "./about-us"}}]);

      supertest(app)
        .get("/route-data.json?path=%2Fabout-us")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal("static-page", response.data.pageType);
        }).then(done);
    });

    // FIXME IS THIS A BUG, or do we depend on this behavior?
    it("disableIsomorphicComponent is always set to true", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {pageType, params}}), [{path: "/about-us", pageType: 'about-us', renderParams: {contentTemplate: "./about-us"}, disableIsomorphicComponent: false}]);

      supertest(app)
        .get("/route-data.json?path=%2Fabout-us")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal(true, response.disableIsomorphicComponent);
        }).then(done);
    });
  })

  describe("isomorphic handler", function() {
    it("It renders a static page", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {pageType, params}}), [{path: "/about-us", pageType: "about-us", renderParams: {contentTemplate: "./about-us"}}]);
      supertest(app)
        .get("/about-us")
        .expect("Content-Type", /html/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal("about-us", response.store.qt.data.pageType);
          assert.equal("./about-us", response.contentTemplate);
          assert.equal(true, response.disableAjaxNavigation);
          assert.equal(true, response.store.qt.disableIsomorphicComponent);
        }).then(done);
    });

    it("defaults the pagetype to static page", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {pageType, params}}), [{path: "/about-us", renderParams: {contentTemplate: "./about-us"}}]);
      supertest(app)
        .get("/about-us")
        .expect("Content-Type", /html/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal("static-page", response.store.qt.data.pageType);
        }).then(done);
    });

    it("can also set disableIsomorphicComponent to false", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({data: {pageType, params}}), [{path: "/about-us", renderParams: {contentTemplate: "./about-us"}, disableIsomorphicComponent: false}]);
      supertest(app)
        .get("/about-us")
        .expect("Content-Type", /html/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal(false, response.store.qt.disableIsomorphicComponent);
        }).then(done);
    });
  });
});
