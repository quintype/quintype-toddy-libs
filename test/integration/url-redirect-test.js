const express = require("express");

const { isomorphicRoutes } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () =>
      Promise.resolve({
        config: { foo: "bar", "theme-attributes": {} },
        "publisher-id": 42,
      }),
    getCustomPathData: (path) => {
      switch (path) {
        case "/moved-permanently":
          return Promise.resolve({
            page: {
              id: 101,
              type: "redirect",
              "status-code": 301,
              "destination-path": "/permanent-location",
            },
          });
        case "/moved-temporarily":
          return Promise.resolve({
            page: {
              id: 102,
              type: "redirect",
              "status-code": 302,
              "destination-path": "/temporary-location",
            },
          });

        default:
          return Promise.resolve({ page: null, "status-code": 404 });
      }
    },
  };
}

function createApp(loadData, routes, opts = {}) {
  const app = express();
  isomorphicRoutes(
    app,
    Object.assign(
      {
        assetHelper: {
          assetHash: (file) => (file === "app.js" ? "abcdef" : null),
          assetPath: (file) => `/assets/${file}`,
        },
        getClient: getClientStub,
        generateRoutes: () => routes,
        loadData,
        renderLayout: (res, { contentTemplate, store }) =>
          res.send(
            JSON.stringify({ contentTemplate, store: store.getState() })
          ),
        handleNotFound: false,
        publisherConfig: {},
      },
      opts
    )
  );

  return app;
}

describe("Redirect Routes Handler", function () {
  it("Redirects all the urls with status code to 301 if redirectUrls is present", function (done) {
    const app = createApp(
      (pageType, params, config, client, { host, next }) => next(),
      [{ pageType: "story-page", path: "/*" }],
      {
        redirectUrls: [
          {
            sourceUrl: "/moved-permanently",
            destinationUrl: "/permanent-location",
            statusCode: 301,
          },
        ],
      }
    );
    supertest(app)
      .get("/moved-permanently")
      .expect("Location", "/permanent-location")
      .expect(301, done);
  });

  it("Redirects all the urls with status code to 302 if redirectUrls is present", function (done) {
    const app = createApp(
      (pageType, params, config, client, { host, next }) => next(),
      [{ pageType: "story-page", path: "/*" }],
      {
        redirectUrls: [
          {
            sourceUrl: "/moved-temporarily",
            destinationUrl: "/temporarily-location",
            statusCode: 302,
          },
        ],
      }
    );
    supertest(app)
      .get("/moved-temporarily")
      .expect("Location", "/temporarily-location")
      .expect(302, done);
  });

  it("Should not crash if redirectUrls is not present", function (done) {
    const app = createApp(
      (pageType, params, config, client, { host, next }) => next(),
      [{ pageType: "story-page", path: "/*" }]
    );
    supertest(app)
      .get("/moved-temporarily")
      .expect("Location", "/temporary-location")
      .expect(
        "Cache-Control",
        "public,max-age=15,s-maxage=900,stale-while-revalidate=1000,stale-if-error=14400"
      )
      .expect("Vary", /Accept\-Encoding/)
      .expect("Surrogate-Control", /public/)
      .expect("Surrogate-Key", "u/42/102")
      .expect("Cache-Tag", "u/42/102")
      .expect(302, done);
  });

  it("Returns 404 if the route doesn't exist", function (done) {
    const app = createApp(
      (pageType, params, config, client, { host, next }) => next(),
      [{ pageType: "story-page", path: "/*" }]
    );
    supertest(app).get("/does-not-exist").expect(404, done);
  });
});
