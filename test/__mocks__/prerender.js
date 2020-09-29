const assert = require("assert").strict;
const express = require("express");

const supertest = require("supertest");
const createApp = require("../../server/create-app");

describe("Prerender", function () {
  const newApp = express();
  const newServer = newApp.listen(4000);

  newApp.get("/*", (req, res) => {
    return res.status("200").send("Prerender");
  });

  const app = createApp({
    publicFolder: "test",
    assetHelper: { assetFiles: () => new Set(["/babel.js"]) },
    prerenderServiceUrl: "http://localhost:4000",
  });

  app.get("/foobar", (req, res) => {
    return res.status("200").send("Foobar");
  });

  it("Should run prerender servre if i pass any other server top of it", function (done) {
    supertest(newServer)
      .get("/http://localhost:3000")
      .expect(200)
      .then((res) => {
        assert.equal("Prerender", res.text);
      })
      .then(done);
  });

  it("Should include prerender middleware if prerenderServiceUrl is available", function (done) {
    supertest(app)
      .get("/foobar?preload=true")
      .set(
        "user-agent",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      )
      .expect(200)
      .then((res) => {
        assert.equal("Foobar", res.text);
      })
      .then(done);
  });
  newServer.close();
});
