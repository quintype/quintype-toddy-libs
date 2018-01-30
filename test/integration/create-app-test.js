var assert = require('assert');
const createApp = require("../../server/create-app");
const supertest = require("supertest");
const fs = require("fs");

describe('createApp', function() {
  const app = createApp();
  app.get("/foo", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(fs.readFileSync("package.json"));
  })

  it("correctly gzips content", function(done) {
    supertest(app)
      .get("/foo")
      .set("Accept-Encoding", "deflate, gzip")
      .expect("Transfer-Encoding", /chunked/)
      .expect("Content-Encoding", /gzip/)
      .expect(200, done)
  })
});
