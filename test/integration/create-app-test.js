var assert = require("assert");
const createApp = require("../../server/create-app");
const supertest = require("supertest");
const fs = require("fs");

describe("createApp", function () {
  const app = createApp({
    publicFolder: "test",
    assetHelper: { assetFiles: () => new Set(["/babel.js"]) },
  });

  app.get("/foo", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(fs.readFileSync("package.json"));
  });

  it("correctly gzips content", function (done) {
    supertest(app)
      .get("/foo")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Transfer-Encoding", /chunked/)
      .expect("Content-Encoding", /gzip/)
      .expect(200, done);
  });

  it("returns static files", function (done) {
    supertest(app)
      .get("/integration/create-app-test.js")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Cache-Control", "public, max-age=3600")
      .expect("Vary", "Accept-Encoding")
      .expect("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
      .expect(200, done);
  });

  it("static files that are assets have a long cache header", function (done) {
    supertest(app)
      .get("/babel.js")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Cache-Control", "public,max-age=31104000,s-maxage=31104000")
      .expect("Vary", "Accept-Encoding")
      .expect("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
      .expect(200, done);
  });
});
