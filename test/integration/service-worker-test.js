var assert = require('assert');
const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({sections: [{slug: "news"}]})
  }
}

function renderLayoutStub(res, layout, params, callback) {
  const content = JSON.stringify({
    serviceWorkerHelper: params.serviceWorkerHelper,
    jsPath: params.assetPath("app.js"),
    hostname: params.hostname,
    assetHash: params.assetHash("app.js"),
    routes: params.routes,
    layout: layout,
  });
  return callback(null, content);
}

describe('ServiceWorker Generator', function() {
  const app = express();
  isomorphicRoutes(app, {
    assetHelper: {
      assetHash: (file) => file == "app.js" ? "abcdef" : null,
      serviceWorkerContents: () => "service-worker-contents",
      assetPath: (file) => `//cdn/${file}`,
    },
    getClient: getClientStub,
    renderServiceWorker: renderLayoutStub,
    generateRoutes: (config) => config.sections.map(section => ({path: `/${section.slug}`})).concat([{skipPWA: true, path: "/skip"}]),
    oneSignalServiceWorkers: true,
    publisherConfig: {},
  })

  it("generates the service worker correctly", function(done) {
    supertest(app)
      .get("/service-worker.js")
      .expect("Content-Type", /javascript/)
      .expect(200)
      .then(res => {
        const {serviceWorkerHelper, jsPath, hostname, assetHash, layout} = JSON.parse(res.text);
        assert.equal('service-worker-contents', serviceWorkerHelper);
        assert.equal('//cdn/app.js', jsPath);
        assert.equal('127.0.0.1', hostname);
        assert.equal('abcdef', assetHash);
        assert.equal("js/service-worker", layout);
      })
      .then(done);
  })

  it("skips only includes PWA routes in the route", function(done) {
    supertest(app)
      .get("/service-worker.js")
      .expect("Content-Type", /javascript/)
      .expect(200)
      .then(res => {
        const {routes} = JSON.parse(res.text);
        assert.equal(1, routes.length);
        assert.equal("/news", routes[0].path);
      })
      .then(done);
  });

  it("generates the one signal handler", function(done) {
    supertest(app)
      .get("/OneSignalSDKWorker.js")
      .expect("Content-Type", /javascript/)
      .expect(200)
      .then(res => {
        assert(res.text.match(/OneSignalSDK.js/));
      })
      .then(done);
  })
});
