var assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({foo: "bar"}),
    getStaticData: () => Promise.resolve({"type":"redirect","status-code":301,"destination-path":"/foobar"}),
  }
}

function createApp(loadData, routes, opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    //assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null, assetPath: (file) => `/assets/${file}`},
    getClient: getClientStub,
    generateRoutes: () => routes,
    loadData: loadData,
    //pickComponent: pickComponent,
    //renderLayout: (res, {store, title, content}) => res.send(JSON.stringify({store: store.getState(), title, content}))
  }, opts));
  
  return app;
}


describe('Custom Route Handler', function() {
  it("Redirects with proper status code if API has a redirection setup", function(done) {
    const app = createApp((pageType, params, config, client, {host, next}) => next(), [{pageType: 'story-page', path: '/*'}]);
      supertest(app)
        .get("/no-longer-here")
        .expect("Location", "/foobar")
        .expect(301, done);
  });
})
