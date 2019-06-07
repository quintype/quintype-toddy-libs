var assert = require('assert');
const createApp = require("../../server/create-app");
const supertest = require("supertest");
const fs = require("fs");

describe('createApp', function() {
  const app = createApp({publicFolder: "test", assetHelper: {assetFiles: () => new Set(["/babel.js"])}});

  app.get("/foo", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(fs.readFileSync("package.json"));
  });

  it("correctly gzips content", function(done) {
    supertest(app)
      .get("/foo")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Transfer-Encoding", /chunked/)
      .expect("Content-Encoding", /gzip/)
      .expect(200, done)
  });

  it("returns static files", function(done) {
    supertest(app)
      .get("/integration/create-app-test.js")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Cache-Control", 'public, max-age=3600')
      .expect("Vary", 'Accept-Encoding')
      .expect(200, done)
  });

  it("static files that are assets have a long cache header", function(done) {
    supertest(app)
      .get("/babel.js")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Cache-Control", 'public,max-age=31104000,s-maxage=31104000')
      .expect("Vary", 'Accept-Encoding')
      .expect(200, done)
  });
});
