var assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({foo: "bar"}),
    getCustomPathData: (path) => {
      switch(path) {
        case '/moved-permanently':
          return Promise.resolve({"page":{"type":"redirect","status-code":301,"destination-path":"/permanent-location"}});
        case '/moved-temporarily':
          return Promise.resolve({"page":{"type":"redirect","status-code":302,"destination-path":"/temporary-location"}});
        default:
          return Promise.resolve({"page":null,"status-code":404});               
      }
    },
  }
}

function createApp(loadData, routes, opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null, assetPath: (file) => `/assets/${file}`},
    getClient: getClientStub,
    generateRoutes: () => routes,
    loadData: loadData,    
    handleNotFound: false
  }, opts));
  
  return app;
}


describe('Custom Route Handler', function() {
  it("Redirects with status code 301 if API has 301 redirection setup", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/moved-permanently")
      .expect("Location", "/permanent-location")
      .expect(301, done);
  });

  it("Redirects with status code 302 if API has 302 redirection setup", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/moved-temporarily")
      .expect("Location", "/temporary-location")
      .expect(302, done);
  });

  it("Returns 404 if the route doesn't exist", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/does-not-exist")
      .expect(404, done);
  });
})
