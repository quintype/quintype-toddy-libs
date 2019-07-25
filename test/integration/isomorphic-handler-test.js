const assert = require('assert');
const express = require("express");
const React = require("react");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () => Promise.resolve({foo: "bar", "sketches-host": "https://www.foo.com"})
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
    loadData,
    pickComponent: opts.pickComponent || pickComponent,
    renderLayout: (res, {store, title, content}) => res.send(JSON.stringify({store: store.getState(), title, content})),
    handleCustomRoute: false,
    publisherConfig: {},
  }, opts));

  return app;
}

describe('Isomorphic Handler', function() {
  it("Renders the page if the route matches", function(done) {
    const app = createApp((pageType, params, config, client, {host}) => Promise.resolve({pageType, data: {text: "foobar", host}}), [{pageType: 'home-page', path: '/'}]);

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("<div data-page-type=\"home-page\">foobar</div>", response.content);
        assert.equal("foobar", response.store.qt.data.text);
        assert.equal("127.0.0.1", response.store.qt.data.host);
        assert.equal("home-page", response.store.qt.pageType);
      }).then(done);
  });

  it('Accepts an async pickComponent function', function(done) {
    const app = createApp((pageType, params, config, client, {host}) => Promise.resolve({pageType, data: {text: "foobar"}}), [{pageType: 'home-page', path: '/'}], {
      pickComponent: (pageType) => Promise.resolve(pickComponent(pageType))
    });

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("<div data-page-type=\"home-page\">foobar</div>", response.content);
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

  it("Throws a 404 if the route is not matched", function(done) {
    const app = createApp((pageType, params, config, client) => Promise.resolve(), [{pageType: 'home-page', path: '/', exact: true}], {
      loadErrorData: (err, config, client, {host}) => ({httpStatusCode: err.httpStatusCode, pageType: "not-found", data: {text: "foobar", host}})
    });

    supertest(app)
      .get("/not-found")
      .expect("Content-Type", /html/)
      .expect(404)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal('<div data-page-type="not-found">foobar</div>', response.content);
        assert.equal(false, response.store.qt.disableIsomorphicComponent);
        assert.equal("127.0.0.1", response.store.qt.data.host);
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
        assert.equal('<div data-page-type="not-found">foobar</div>', response.content);
        assert.equal(true, response.store.qt.disableIsomorphicComponent);
      }).then(done, done);
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
      .expect("Cache-Control", "public,max-age=15,s-maxage=900,stale-while-revalidate=1000,stale-if-error=14400")
      .expect("Vary", "Accept-Encoding")
      .expect("Surrogate-Control", /public/)
      .expect("Surrogate-Key", "foo bar")
      .expect("Cache-Tag", "foo,bar")
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
  });

  describe("aborting the data loader", () => {
    it("Throws a 404 if load data decides not to handle the request", function(done) {
      const app = createApp((pageType, params, config, client, {next}) => next(), [{pageType: 'home-page', path: '/skip', exact: true}], {
        loadErrorData: (err, config, client, {host}) => ({httpStatusCode: err.httpStatusCode, pageType: "not-found", data: {text: "foobar", host}})
      });

      supertest(app)
        .get("/skip")
        .expect("Content-Type", /html/)
        .expect(404)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal('<div data-page-type="not-found">foobar</div>', response.content);
          assert.equal(false, response.store.qt.disableIsomorphicComponent);
          assert.equal("127.0.0.1", response.store.qt.data.host);
        }).then(done, done);
    });

    it("Allows bypassing even data.abort is set", function(done) {
      const app = createApp((pageType, params, config, client, {next}) => next().then(n => ({data: n})), [{pageType: 'home-page', path: '/skip', exact: true}], {
        loadErrorData: (err, config, client, {host}) => ({httpStatusCode: err.httpStatusCode, pageType: "not-found", data: {text: "foobar", host}})
      });

      supertest(app)
        .get("/skip")
        .expect("Content-Type", /html/)
        .expect(404)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal('<div data-page-type="not-found">foobar</div>', response.content);
          assert.equal(false, response.store.qt.disableIsomorphicComponent);
          assert.equal("127.0.0.1", response.store.qt.data.host);
        }).then(done);
    });

    it("Allows you to chain one loader to the next if two routes overlap", function(done) {
      const overlappingRoutes = [{pageType: "skip", path: "/"}, {pageType: 'home-page', path: '/'}];
      const dataLoader = (pageType, _1, _2, _3, {host, next}) => pageType == 'skip' ? next() : Promise.resolve({pageType, data: {text: "foobar", host}})

      const app = createApp(dataLoader,  overlappingRoutes);

      supertest(app)
        .get("/")
        .expect("Content-Type", /html/)
        .expect(200)
        .then(res => {
          const response = JSON.parse(res.text);
          assert.equal("<div data-page-type=\"home-page\">foobar</div>", response.content);
          assert.equal("foobar", response.store.qt.data.text);
          assert.equal("127.0.0.1", response.store.qt.data.host);
          assert.equal("home-page", response.store.qt.pageType);
        }).then(done);
    })
  });

  it("Passes the primaryHostUrl and currentHostUrl to the render", function (done) {
    const app = createApp((pageType, params, config, client, { host }) => Promise.resolve({ pageType, data: { text: "foobar", host } }), [{ pageType: 'home-page', path: '/' }]);

    supertest(app)
      .get("/")
      .expect("Content-Type", /html/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("https://www.foo.com", response.store.qt.currentHostUrl);
        assert.equal("https://www.foo.com", response.store.qt.primaryHostUrl);
      }).then(done);
  });
});
