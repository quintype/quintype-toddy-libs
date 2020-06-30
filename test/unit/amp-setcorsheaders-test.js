/* eslint-disable func-names */
/* eslint-disable consistent-return */
import supertest from "supertest";
import { setCorsHeaders } from "../../server/amp-helpers";

const express = require("express");
const assert = require("assert");

function createApp(app = express()) {
  app.get("/test/cors/route", function (req, res) {
    const dummyPublisherConfig = {
      "sketches-host": "https://www.vikatan.com",
      domains: [
        {
          name: "entertainment",
          slug: "entertainment",
          "host-url": "https://cinema.vikatan.com",
          "beta-host-url": null,
        },
        {
          name: "sports",
          slug: "sports",
          "host-url": "https://sports.vikatan.com",
          "beta-host-url": null,
        },
      ],
    };
    setCorsHeaders({ req, res, publisherConfig: dummyPublisherConfig });
    if (!res.headersSent) return res.send("test");
  });
  return app;
}

describe("setCorsHeaders helper function", () => {
  it("sets CORS headers for same-origin requests that have amp-same-origin header set", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("amp-same-origin", "true")
      .expect("access-control-allow-origin", "*")
      .expect(200, done);
  });
  it("sets CORS headers for requests coming from google CDN", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://www-vikatan-com.cdn.ampproject.org")
      .expect(
        "access-control-allow-origin",
        "https://www-vikatan-com.cdn.ampproject.org"
      )
      .expect(200, done);
  });
  it("sets CORS headers for requests coming from bing CDN", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://www-vikatan-com.www.bing-amp.com")
      .expect(
        "access-control-allow-origin",
        "https://www-vikatan-com.www.bing-amp.com"
      )
      .expect(200, done);
  });
  it("sets CORS headers for requests coming from a valid subdomain", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://cinema.vikatan.com")
      .expect("access-control-allow-origin", "https://cinema.vikatan.com")
      .expect(200, done);
  });
  it("sets a 401 on requests originating from an invalid subdomain", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://foo.vikatan.com")
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(JSON.stringify("Unauthorized"), res.text);
        return done();
      });
  });
  it("sets CORS headers for requests coming from a cached subdomain (Google)", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://cinema-vikatan-com.cdn.ampproject.org")
      .expect(
        "access-control-allow-origin",
        "https://cinema-vikatan-com.cdn.ampproject.org"
      )
      .expect(200, done);
  });
  it("sets CORS headers for requests coming from a cached subdomain (Bing)", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://cinema-vikatan-com.www.bing-amp.com")
      .expect(
        "access-control-allow-origin",
        "https://cinema-vikatan-com.www.bing-amp.com"
      )
      .expect(200, done);
  });
  it("sets a 401 on requests originating from a non-whitelisted source", function (done) {
    const app = createApp();
    supertest(app)
      .get("/test/cors/route")
      .set("origin", "https://www.facebook.com")
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(JSON.stringify("Unauthorized"), res.text);
        return done();
      });
  });
});
