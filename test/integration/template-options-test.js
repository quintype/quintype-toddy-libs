const assert = require("assert");
const express = require("express");
const supertest = require("supertest");

const { isomorphicRoutes } = require("../../server/routes");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () =>
      Promise.resolve({ "publisher-settings": { title: "Madrid" } }),
  };
}

describe("TemplateOptionsHandler", function () {
  it("returns the template options", function (done) {
    const app = express();
    isomorphicRoutes(app, {
      assetHelper: {},
      getClient: getClientStub,
      templateOptions: { name: "Madrid", foo: "bar" },
      publisherConfig: {},
    });

    supertest(app)
      .get("/template-options.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect("Access-Control-Allow-Origin", "*")
      .expect("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
      .expect(200)
      .then((res) => {
        const { name, foo } = JSON.parse(res.text);
        assert.equal("Madrid", name);
        assert.equal("bar", foo);
      })
      .then(done);
  });

  it("does template options when passed in a function", function (done) {
    const app = express();
    isomorphicRoutes(app, {
      assetHelper: {},
      getClient: getClientStub,
      templateOptions: (config) => ({
        name: config["publisher-settings"].title,
      }),
      publisherConfig: {},
    });

    supertest(app)
      .get("/template-options.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect("Vary", "Accept-Encoding")
      .expect("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
      .expect(200)
      .then((res) => {
        const { name, foo } = JSON.parse(res.text);
        assert.equal("Madrid", name);
      })
      .then(done);
  });
});
