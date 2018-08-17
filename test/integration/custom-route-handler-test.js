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
        case '/moved-p':
          return Promise.resolve({"page":{"type":"redirect","status-code":301,"destination-path":"/moved-p-path"}});
        case '/moved-t':
          return Promise.resolve({"page":{"type":"redirect","status-code":302,"destination-path":"/moved-t-path"}});
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
  it("Redirects with status code 301 if API has a redirection setup", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/moved-p")
      .expect("Location", "/moved-p-path")
      .expect(301, done);
  });

  it("Redirects with status code 302 if API has a redirection setup", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/moved-t")
      .expect("Location", "/moved-t-path")
      .expect(302, done);
  });

  it("Returns 404 if the route doesn't exist", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/does-not-exist")
      .expect(404, done);
  });
})
