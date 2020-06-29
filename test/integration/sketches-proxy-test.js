const assert = require("assert");
const express = require("express");

const {
  upstreamQuintypeRoutes,
  mountQuintypeAt,
} = require("../../server/routes");
const supertest = require("supertest");

describe("Sketches Proxy", function () {
  let upstreamServer;

  before(function (next) {
    const upstreamApp = express();
    upstreamApp.all("/*", (req, res) =>
      res.send(
        JSON.stringify({
          method: req.method,
          url: req.url,
          host: req.headers.host,
        })
      )
    );
    upstreamServer = upstreamApp.listen(next);
  });

  describe("forwarding requests", function () {
    function buildApp({ app = express() } = {}) {
      upstreamQuintypeRoutes(app, {
        config: {
          sketches_host: `http://127.0.0.1:${upstreamServer.address().port}`,
        },
        getClient: (host) => ({ getHostname: () => host.toUpperCase() }),
        extraRoutes: ["/custom-route"],
        forwardAmp: true,
        forwardFavicon: true,
        publisherConfig: {},
      });
      return app;
    }

    it("forwards requests to sketches", function (done) {
      supertest(buildApp())
        .get("/api/v1/config")
        .expect(200)
        .then((res) => {
          const { method, url, host } = JSON.parse(res.text);
          assert.equal("GET", method);
          assert.equal("/api/v1/config", url);
          assert.equal("127.0.0.1", host);
        })
        .then(done);
    });

    it("forwards custom routes to sketches", function (done) {
      supertest(buildApp())
        .get("/custom-route")
        .expect(200)
        .then((res) => {
          const { method, url, host } = JSON.parse(res.text);
          assert.equal("GET", method);
          assert.equal("/custom-route", url);
          assert.equal("127.0.0.1", host);
        })
        .then(done);
    });

    it("grabs the hostname from the client", function (done) {
      supertest(buildApp())
        .get("/amp/story/foo")
        .set("Host", "foobar.com")
        .expect(200)
        .then((res) => {
          const { host } = JSON.parse(res.text);
          assert.equal("FOOBAR.COM", host);
        })
        .then(done);
    });

    it("does not forward unknown requests", function (done) {
      supertest(buildApp()).get("/unknown").expect(404, done);
    });

    it("forwards amp requests", function (done) {
      supertest(buildApp())
        .get("/amp/story/foo")
        .expect(200)
        .then((res) => {
          const { url } = JSON.parse(res.text);
          assert.equal("/amp/story/foo", url);
        })
        .then(done);
    });

    it("gets favicon", function (done) {
      supertest(buildApp())
        .get("/favicon.ico")
        .expect(200)
        .then((res) => {
          const { url } = JSON.parse(res.text);
          assert.equal("/favicon.ico", url);
        })
        .then(done);
    });

    it("allows mounting at a different path", function (done) {
      const app = express();
      mountQuintypeAt(app, "/foo");
      supertest(buildApp({ app }))
        .get("/foo/api/v1/config")
        .expect(200)
        .then((res) => {
          const { method, url, host } = JSON.parse(res.text);
          assert.equal("GET", method);
          assert.equal("/api/v1/config", url);
          assert.equal("127.0.0.1", host);
        })
        .then(done);
    });
  });

  describe("ping check", function () {
    function buildApp(getConfig) {
      const app = express();
      upstreamQuintypeRoutes(app, {
        config: {
          sketches_host: `http://127.0.0.1:${upstreamServer.address().port}`,
        },
        getClient: (host) => ({ getConfig }),
      });
      return app;
    }

    it("returns a successful ping if the config is loaded", async function () {
      await supertest(buildApp(() => Promise.resolve({})))
        .get("/ping")
        .expect(200);
    });

    it("fails with a 503 if the config fails", async function () {
      await supertest(buildApp(() => Promise.reject({})))
        .get("/ping")
        .expect(503);
    });

    it("responds with a ping even if it's mounted somewhere", async function () {
      const app = express();
      mountQuintypeAt(app, "/foo");
      upstreamQuintypeRoutes(app, {
        config: {
          sketches_host: `http://127.0.0.1:${upstreamServer.address().port}`,
        },
        getClient: (host) => ({ getConfig: () => Promise.resolve({}) }),
      });

      await supertest(app).get("/ping").expect(200);

      await supertest(app).get("/foo/ping").expect(200);
    });
  });

  after(function () {
    upstreamServer.close();
  });
});
