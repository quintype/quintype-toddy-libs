var assert = require('assert');
const express = require("express");

const { enableVisualStories } = require("../../server/visual-stories");
const supertest = require("supertest");

function getClientStub(hostname, relatedStories = []) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({ "publisher-settings": { title: "Madrid" } }),
    getRelatedStories: () => ({'related-stories': relatedStories}),
  }
}

getClientStub.withRelatedStories = function(relatedStories) {
  return hostname => getClientStub(hostname, relatedStories);
}

describe('Visual Stories Bookend', function () {
  it("returns the bookend if there are related stories", function(done) {
    const app = express();
    enableVisualStories(app, () => { }, { getClient: getClientStub.withRelatedStories([{headline: "foo"}]) })
    supertest(app)
      .get("/ampstories/unknown/bookend.json")
      .expect("Content-Type", /json/)
      .expect("Cache-Control", /public/)
      .expect(200)
      .then(res => {
        const response = JSON.parse(res.text);
        assert.equal("v1.0", response.bookendVersion);
        assert.equal(3, response.components.length);
        assert.equal("foo", response.components[1].title);
      })
      .then(() => done());
  });

  it("returns a 404 if there are no related stories", function (done) {
    const app = express();
    enableVisualStories(app, () => {}, {getClient: getClientStub})
    supertest(app)
      .get("/ampstories/unknown/bookend.json")
      .expect("Content-Type", /json/)
      .expect(404)
      .then(() => done());
  });
});
