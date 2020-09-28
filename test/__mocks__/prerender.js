const assert = require("assert").strict;
const express = require("express");

const supertest = require("supertest");
const createApp = require("../../server/create-app");

describe("Prerender", function () {
  const app = createApp({
    publicFolder: "test",
    assetHelper: { assetFiles: () => new Set(["/babel.js"]) },
    prerenderServiceUrl: "https://prerender.quintype.io",
  });

  // const newApp = express();

  it("Should prerender the app if prerenderServiceUrl is available", function (done) {
    supertest(app)
      .get("/foo?preload=true")
      .set(
        "user-agent",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      )
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Cache-Control", "public, max-age=3600")
      .expect("Vary", "Accept-Encoding")
      .expect(200)
      .then((res) => console.log("res here", res))
      .then(done)
      .catch((error) => console.log("here error", error));
  });
});
