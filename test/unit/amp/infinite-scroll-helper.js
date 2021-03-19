/* eslint-disable func-names */

const assert = require("assert");
const InfiniteScrollAmp = require("../../../server/amp/helpers/infinite-scroll");

function getClientStub() {
  return {
    getCollectionBySlug: (slug) =>
      Promise.resolve({
        items: [{ type: "story", id: 123, story: {"story-content-id": 1111} }],
      }),
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
    })
    assert.strictEqual(inlineConfig instanceof Error, true)
    assert.throws(() => {
      throw new Error("Required params for getInitialInlineConfig missing")
    }, inlineConfig)
  });
});
