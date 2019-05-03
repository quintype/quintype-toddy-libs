const assert = require('assert');
const express = require("express");

const { enableVisualStories } = require("../../server/visual-stories");
const supertest = require("supertest");

function getClientStub(hostname) {
  return {
    getHostname: () => hostname,
    getConfig: () => Promise.resolve({ "publisher-settings": { title: "Madrid" }, 'publisher-id': 42 }),
  }
}

getClientStub.withRelatedStories = relatedStories => hostname => Object.assign({}, getClientStub(hostname), {
    getRelatedStories: async () => ({'related-stories': relatedStories})
  })

getClientStub.withStory = story => hostname => Object.assign({}, getClientStub(hostname), {
    getStoryBySlug: async () => ({story})
  })

describe('Visual Stories Bookend', () => {
  it("returns the bookend if there are related stories", (done) => {
    const app = express();
    enableVisualStories(app, () => { }, { getClient: getClientStub.withRelatedStories([{headline: "foo"}]), publisherConfig: {} })
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

  it("returns a 404 if there are no related stories", (done) => {
    const app = express();
    enableVisualStories(app, () => {}, {getClient: getClientStub.withRelatedStories([]), publisherConfig: {}})
    supertest(app)
      .get("/ampstories/unknown/bookend.json")
      .expect("Content-Type", /json/)
      .expect(404)
      .then(() => done());
  });
});

describe("Visual Stories AmpPage", () => {
  it("calls render if the story is present and adds caching headers", (done) => {
    const story = {headline: "foobar", id: "abcdefgh", "story-template": "visual-story"};
    const app = express();
    enableVisualStories(app, (res, story) => { res.json(story.asJson()) }, { getClient: getClientStub.withStory(story), publisherConfig: {} })
    supertest(app)
      .get("/ampstories/section/slug")
      .expect("Cache-Control", /public/)
      .expect("Cache-Tag", "s/42/abcdefgh")
      .expect(200)
      .then(res => {
        const {headline} = JSON.parse(res.text);
        assert.equal("foobar", headline)
      })
      .then(done);
  })

  it("returns 404 if the story is not found", (done) => {
    const app = express();
    enableVisualStories(app, () => { }, { getClient: getClientStub.withStory(null), publisherConfig: {} })
    supertest(app)
      .get("/ampstories/section/slug")
      .expect(404)
      .then(() => done());
  })

  it("returns 404 if the story is not a visual story", (done) => {
    const app = express();
    enableVisualStories(app, () => { }, { getClient: getClientStub.withStory({'story-template': 'blank'}), publisherConfig: {} })
    supertest(app)
      .get("/ampstories/section/slug")
      .expect(404)
      .then(() => done());
  })
})
