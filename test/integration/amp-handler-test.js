import supertest from "supertest";
import { ampRoutes } from "../../server/routes";

const assert = require("assert");
const express = require("express");

const ampConfig = {
  fonts: {
    primary: {
      url: "Open+Sans:300,400,600,700",
      family: '"Open Sans", sans-serif',
    },
    secondary: {
      url: "PT+Serif:400,400italic,700,700italic",
      family: "sans-serif",
    },
  },
  colors: {
    primary: "#294f32",
    secondary: "#763194",
    "footer-background": "#FDBD10",
    "footer-text-color": "#FDBD10",
    "header-background": "#dd0b4d",
    "section-text-color": "#f4e842",
  },
  "invalid-elements-strategy": "redirect-to-web-version",
  "related-collection-id": 1234,
};

function getClientStub(hostname) {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () =>
      Promise.resolve({
        ...publisherConfig,
        memoizeAsync: (key, fn) => {
          return ampConfig;
        },
      }),
    getStoryBySlug: (slug, params) =>
      Promise.resolve({
        story: {
          id: "1",
          headline: "Story Headline",
          "hero-image-metadata": {
            width: 5472,
            height: 3648,
            "mime-type": "image/jpeg",
            "file-size": 6127839,
            "file-name": "Sample file",
            "focus-point": [2609, 1102],
          },
          "hero-image-s3-key": "barandbench/2020-01/sample.jpg",

          cards: [
            {
              "story-elements": [
                {
                  description: "",
                  "page-url":
                    "/story/7f3d5bdb-ec52-4047-ac0d-df4036ec974b/element/9eb8f5cc-6ebe-4fb0-88b8-eca79efde210",
                  type: "text",
                  "family-id": "e9e12f9f-8b9f-4b93-a8c8-83c7b278000f",
                  title: "",
                  id: "9eb8f5cc-6ebe-4fb0-88b8-eca79efde210",
                  metadata: {},
                  subtype: null,
                  text:
                    "<p>In India today, the legal profession is growing in lockstep with one of the world's most dynamic economies. It's no surprise then— that in terms of absolute numbers— India's legal profession is the world's second largest, with over 1.4 million enrolled lawyers in legal practices nationwide.</p>",
                },
              ],
              "card-updated-at": 1581327522163,
              "content-version-id": "efaf78de-c90b-4d15-b040-c84ebb29cabf",
              "card-added-at": 1581327522163,
              status: "draft",
              id: "bf486412-1e8b-45d1-a5fd-51939cfe1ce1",
              "content-id": "bf486412-1e8b-45d1-a5fd-51939cfe1ce1",
              version: 1,
              metadata: {},
            },
          ],
          sections: [{ id: 1, name: "Sports" }],
          "story-template": "text",
          "is-amp-supported": true,
        },
      }),
    getCollectionBySlug: (slug) =>
      Promise.resolve({
        items: [
          {
            id: "1111",
            type: "story",
            story: { "story-content-id": "abc", headline: "abc" },
          },
          {
            id: "2222",
            type: "story",
            story: { "story-content-id": "def", headline: "def" },
          },
        ],
      }),
  };
}
const publisherConfig = {
  "cdn-name": "https://thumbor-stg.assettype.com/",
  "sketches-host": "https://www.vikatan.com",
  "text-direction": "ltr",
  facebook: { "app-id": "1234" },
  "publisher-name": "vikatan",
  env: "production",
  facebook: {
    "app-id": "FB-APP-ID",
  },
  "publisher-id": 1,
  "publisher-settings": {
    title: "Newslaundry",
    description:
      "We have finally migrated our website to better architecture! While the fancy new website will be up in a few months, we have fixed issues related to payment and login in the meantime. You will need to log in anew. If you have forgotten your password, you can generate one by clicking on the forgot password link (it works!). Send any questions or feedback to contact@newslaundry.com.",
    "publisher-logo": null,
    copyright:
      "Copyright © 2020 Newslaundry Media Private Limited.  All Rights Reserved ",
  },
};
function createApp(app = express()) {
  const ampLibrary = {};
  ampLibrary.ampifyStory = ({
    story,
    publisherConfig,
    ampConfig,
    relatedStories,
    client,
    opts: { slots, templates, ...opts },
    seo,
  }) =>
    `<div data-page-type="home-page"><h1 data-test-id="storyHeadline">${
      story.headline
    }</h1><div data-test-id="sections">${story.sections.map(
      (section) => section.name
    )}</div><div data-test-id="relatedStories">${relatedStories.map(
      (story) => `<h3>${story.headline}</h3>`
    )}</div></div>`;
  ampRoutes(app, {
    getClient: getClientStub,
    publisherConfig: publisherConfig,
    ampLibrary,
  });
  return app;
}

const renderedAMPHtml = `<div data-page-type="home-page"><h1 data-test-id="storyHeadline">Story Headline</h1><div data-test-id="sections">Sports</div><div data-test-id="relatedStories"><h3>abc</h3>,<h3>def</h3></div>`;
describe("AmpHandler", () => {
  it("mounts an amp page", (done) => {
    const app = createApp();
    supertest(app)
      .get("/amp/story/foo")
      .expect("Content-Type", /html/)
      .expect(200)
      .then((res) => {
        assert.equal(renderedAMPHtml, res.text);
      })
      .then(done);
  });
  it("mounts an amp page with sections", (done) => {
    const app = createApp();
    supertest(app)
      .get("/amp/story/foo/bar/foobar")
      .expect("Content-Type", /html/)
      .expect(200)
      .then((res) => {
        assert.equal(
          res.text.includes('<div data-test-id="sections">Sports</div>'),
          true
        );
      })
      .then(done);
  });
  it("mounts an amp page with related stories", (done) => {
    const app = createApp();
    supertest(app)
      .get("/amp/story/foo/bar/foobar")
      .expect("Content-Type", /html/)
      .expect(200)
      .then((res) => {
        assert.equal(
          res.text.includes(
            '<div data-test-id="relatedStories"><h3>abc</h3>,<h3>def</h3></div>'
          ),
          true
        );
      })
      .then(done);
  });
  it("mounts an amp page with slug encoded", (done) => {
    const app = createApp();
    supertest(app)
      .get("/amp/story/foo%2Fbar%2Ffoobar")
      .expect("Content-Type", /html/)
      .expect(200)
      .then((res) => {
        assert.equal(renderedAMPHtml, res.text);
      })
      .then(done);
  });
  it("should render something no story slug", (done) => {
    const app = createApp();
    supertest(app)
      .get("/amp/story/")
      .expect("Content-Type", /html/)
      .expect(404)
      .then(() => done());
  });
});
