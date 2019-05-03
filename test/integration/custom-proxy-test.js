var assert = require('assert');
const express = require("express");

const { proxyGetRequest } = require("../../server/routes");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({ "publisher-settings": { title: "Madrid" } })
  }
}

describe('proxyGetHandler', function () {
  it("can proxy a request to a handler which returs some data", function(done) {
    const app = express();
    proxyGetRequest(app, "/some/:api.json", (params) => ({ foo: params.api }), {
      getClient: getClientStub,
      publisherConfig: {},
    });

    supertest(app)
      .get("/some/bar.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect(200)
      .then(res => {
        const { foo } = JSON.parse(res.text);
        assert.equal("bar", foo);
      }).then(done);
  });

  it("returns a 503 if there is no data", function(done) {
    const app = express();
    proxyGetRequest(app, "/some/:api.json", (params) => null, {
      getClient: getClientStub,
      publisherConfig: {},
    });

    supertest(app)
      .get("/some/bar.json")
      .expect(503)
      .then(() => done());
  })

  describe("proxying to another host", function() {
    var upstreamServer;

    before(function (next) {
      const upstreamApp = express();
      upstreamApp.all("/*", (req, res) => res.send(JSON.stringify({ method: req.method, url: req.url, host: req.headers.host })))
      upstreamServer = upstreamApp.listen(next);
    });

    it("forwards the call upstream", function(done) {
      const app = express();

      proxyGetRequest(app, "/some/:api.json", (params) => `http://127.0.0.1:${upstreamServer.address().port}/${params.api}`, {
        getClient: getClientStub,
        publisherConfig: {},
      });

      supertest(app)
        .get("/some/bar.json")
        .expect("Content-Type", /json/)
        .expect("Cache-Control", /public/)
        .expect("Vary", "Accept-Encoding")
        .expect(200)
        .then(res => {
          const {method, url} = JSON.parse(res.text);
          assert.equal(method, "GET");
          assert.equal(url, "/bar");
        }).then(done);
    })

    after(function () {
      upstreamServer.close();
    });
  })
});
