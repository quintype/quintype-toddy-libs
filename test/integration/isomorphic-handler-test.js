var assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({foo: "bar"})
  }
}

function pickComponent(pageType) {
  return ({data}) => <div data-page-type={pageType}>{data.text}</div>;
}

function createApp(loadData, routes, opts = {}) {
  const app = express();
  isomorphicRoutes(app, Object.assign({
    assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null, assetPath: (file) => `/assets/${file}`},
    getClient: getClientStub,
    generateRoutes: () => routes,
    loadData: loadData,
    pickComponent: pickComponent,
    renderLayout: (res, {store, title, content}) => res.send(JSON.stringify({store: store.getState(), title, content}))
  }, opts));

  return app;
}

describe('Isomorphic Handler', function() {
  it("Renders the page if the route matches", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: "foobar"}}), [{pageType: 'home-page', path: '/'}]);

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("<div data-page-type=\"home-page\" data-reactroot=\"\">foobar</div>", response.content);
        assert.equal("foobar", response.store.qt.data.text);
        assert.equal("home-page", response.store.qt.pageType);
      }).then(done);
  });

  it("Passes all URL parameters to the load data function", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: params.text}}), [{pageType: 'home-page', path: '/'}]);

    supertest(app)
      .get("/?text=foobar")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("foobar", response.store.qt.data.text);
      }).then(done);
  });

  describe("preloading", function() {
    it("preloads the app.js", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: "foobar"}}), [{pageType: 'home-page', path: '/'}], {
        preloadJs: true,
      });

      supertest(app)
        .get("/?foo=bar")
        .expect("Content-Type", /html/)
        .expect("Link", '</assets/app.js>; rel=preload; as=script;')
        .expect(200, done);
    })

    it("preloads the route-data", function(done) {
      const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: "foobar"}}), [{pageType: 'home-page', path: '/'}], {
        preloadRouteData: true,
      });

      supertest(app)
        .get("/?foo=bar")
        .expect("Content-Type", /html/)
        .expect("Link", '</route-data.json?path=%2F&foo=bar>; rel=preload; as=fetch;')
        .expect(200, done);
    })
  })

  // it("Redirects to a story from a naked route.", function(done) {
  //   const app = createApp((pageType, params, config, client) => Promise.resolve(), [], {
  //     redirectRootLevelStories: true
  //   });
  // 
  //   supertest(app)
  //     .get("/not-found")
  //     .expect("Content-Type", /html/)
  //     .expect(404)
  //     .then(res => {
  //       const response = JSON.parse(res.text);
  //       assert.equal('<div data-page-type="not-found" data-reactroot="">foobar</div>', response.content);
  //       assert.equal(true, response.store.qt.disableIsomorphicComponent);
  //     }).then(done);
  // });
  
  it("Throws a 404 if the route is not matched", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve(), [{pageType: 'home-page', path: '/', exact: true}], {
      loadErrorData: (err, config) => ({httpStatusCode: err.httpStatusCode, pageType: "not-found", data: {text: "foobar"}})
    });

    supertest(app)
      .get("/not-found")
      .expect("Content-Type", /html/)
      .expect(404)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal('<div data-page-type="not-found" data-reactroot="">foobar</div>', response.content);
        assert.equal(true, response.store.qt.disableIsomorphicComponent);
      }).then(done);
  });

  it("Throws a 500 if loadData doesn't work", function(done) {
    const app = createApp((pageType, params, config, client) => {throw "exception"}, [{pageType: "home-page"}], {
      loadErrorData: (err, config) => ({httpStatusCode: err.httpStatusCode || 500, pageType: "not-found", data: {text: "foobar"}})
    });

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(500)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal('<div data-page-type="not-found" data-reactroot="">foobar</div>', response.content);
        assert.equal(true, response.store.qt.disableIsomorphicComponent);
      }).then(done);
  });

  it("Throws a 500 if loadData and loadErrorData both crash", function(done) {
    const app = createApp((pageType, params, config, client) => {throw "exception"}, [{pageType: "home-page"}], {
      loadErrorData: (err, config) => {throw "foobar"}
    });

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(500, done);
  });

  it("Cache headers are set", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: "foobar", cacheKeys: ["foo", "bar"]}}), [{pageType: 'home-page', path: '/'}]);

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect("Cache-Control", "public,max-age=15,must-revalidate")
      .expect("Vary", "Accept-Encoding")
      .expect("Surrogate-Control", /public/)
      .expect("Surrogate-Key", "foo bar")
      .expect(200, done);
  });

  it("it redirects on a 301", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({httpStatusCode: 301, data: {location: "/foobar"}}), [{pageType: 'home-page', path: '/'}]);

    supertest(app)
      .get("/")
      .expect("Location", "/foobar")
      .expect(301, done);
  });

  it("returns a 500 if render layout crashes", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve({pageType, data: {text: "foobar"}}), [{pageType: 'home-page', path: '/'}], {
      renderLayout: () => {throw "foobar"}
    });
    supertest(app)
      .get("/")
      .expect(500, done);
  })
});
