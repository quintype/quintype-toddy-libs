var assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({config: {foo: "bar", "theme-attributes": {}}}),
    getCustomPathData: (path) => {
      switch(path) {
        case '/moved-permanently':
          return Promise.resolve({"page":{"type":"redirect","status-code":301,"destination-path":"/permanent-location"}});
        case '/moved-temporarily':
          return Promise.resolve({"page":{"type":"redirect","status-code":302,"destination-path":"/temporary-location"}});
        case '/static-with-header-footer':
          return Promise.resolve({"page":{"title":"Testing","content":"<html><head><title>Test</title></head><body><h1>Heading</h1></body></html>","metadata":{"header":true,"footer":false},"type":"static-page","status-code":200}});
        case '/static-without-header-footer':
          return Promise.resolve({"page":{"title":"Testing","content":"<html><head><title>Test</title></head><body><h1>Heading</h1></body></html>","metadata":{"header":false,"footer":false},"type":"static-page","status-code":200}});
        default:
          return Promise.resolve({"page":null,"status-code":404});               
      }
    }
  };
}

function createApp(loadData, routes, opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null, assetPath: (file) => `/assets/${file}`},
    getClient: getClientStub,
    generateRoutes: () => routes,
    loadData: loadData,
    renderLayout: (res, {contentTemplate, store}) => res.send(JSON.stringify({contentTemplate, store: store.getState()})),
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

  it("Renders the page in the normal flow if it's a static page and either header or footer is enabled", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => pageType === "custom-static-page" ? Promise.resolve({}) : next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/static-with-header-footer")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("<html><head><title>Test</title></head><body><h1>Heading</h1></body></html>", response.store.qt.data.content);
        assert.equal("static-page", response.store.qt.pageType);
      }).then(done);
  });

  it("Renders the page by sending the content if it's a static page with disabled header and footer", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/static-without-header-footer")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        assert.equal("<html><head><title>Test</title></head><body><h1>Heading</h1></body></html>", res.text);
      }).then(done);
  });

  it("Returns 404 if the route doesn't exist", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
    supertest(app)
      .get("/does-not-exist")
      .expect(404, done);
  });
})
