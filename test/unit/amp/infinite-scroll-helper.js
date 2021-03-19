/* eslint-disable func-names */

const assert = require("assert");
const InfiniteScrollAmp = require("../../../server/amp/helpers/infinite-scroll");

function getClientStub({
  getCollectionBySlug = (slug) =>
    new Promise((resolve) => {
      if (slug === "amp-infinite-scroll")
      resolve({
        items: [
          {
            type: "story",
            id: 1111,
            story: {
              "story-content-id": 1111,
              slug: "sports/aa",
              "hero-image-s3-key": "aa/a.jpg",
            },
          },
          {
            type: "story",
            id: 2222,
            story: {
              "story-content-id": 2222,
              slug: "sports/bb",
              "hero-image-s3-key": "bb/b.jpg",
            },
          },
          {
            type: "story",
            id: 3333,
            story: {
              "story-content-id": 3333,
              slug: "sports/cc",
              "hero-image-s3-key": "cc/c.jpg",
            },
          },
        ],
      });
      resolve(null);
    }),
} = {}) {
  return {
    getCollectionBySlug,
  };
}
const dummyPublisherConfig = {
  "cdn-image": "gumlet.assettype.com",
};

describe("getInitialInlineConfig method of InfiniteScrollAmp helper function", function () {
  it("should throw err if storyId isn't passed", async function () {
    const infiniteScrollAmp = new InfiniteScrollAmp({
      ampConfig: {},
      client: getClientStub(),
      publisherConfig: dummyPublisherConfig,
    });
    const inlineConfig = await infiniteScrollAmp.getInitialInlineConfig({
      itemsToTake: 5,
    });
    assert.strictEqual(inlineConfig instanceof Error, true);
    assert.throws(() => {
      throw new Error("Required params for getInitialInlineConfig missing");
    }, inlineConfig);
  });
  it("should return null if infinite scroll collection doesn't exist", async function () {
    const clientStub = getClientStub({
      getCollectionBySlug: (slug) =>
        new Promise((resolve) => {
          resolve(null);
        }),
    });
    const infiniteScrollAmp = new InfiniteScrollAmp({
      ampConfig: {},
      client: clientStub,
      publisherConfig: dummyPublisherConfig,
    });
    const inlineConfig = await infiniteScrollAmp.getInitialInlineConfig({
      itemsToTake: 5,
      storyId: 2222,
    });
    assert.strictEqual(inlineConfig, null);
  });
  it("should return null if infinite scroll collection contains no stories", async function () {
    const clientStub = getClientStub({
      getCollectionBySlug: (slug) =>
        new Promise((resolve) => {
          resolve({
            items: [],
          });
        }),
    });
    const infiniteScrollAmp = new InfiniteScrollAmp({
      ampConfig: {},
      client: clientStub,
      publisherConfig: dummyPublisherConfig,
    });
    const inlineConfig = await infiniteScrollAmp.getInitialInlineConfig({
      itemsToTake: 5,
      storyId: 2222,
    });
    assert.strictEqual(inlineConfig, null);
  });
  it("should remove current story from infinite scroll", async function () {
    const clientStub = getClientStub();
    const infiniteScrollAmp = new InfiniteScrollAmp({
      ampConfig: {},
      client: clientStub,
      publisherConfig: dummyPublisherConfig,
    });
    const inlineConfig = await infiniteScrollAmp.getInitialInlineConfig({
      itemsToTake: 5,
      storyId: 2222,
    });
    assert.strictEqual(false, /sports\/bb/.test(inlineConfig));
    assert.strictEqual(false, /bb\/b.jpg/.test(inlineConfig));
  });
});
