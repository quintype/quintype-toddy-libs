/**
 * Note: Tests to be written for this once https://github.com/quintype/quintype-node-framework/pull/202 is merged
 *!!!! REMOVE THIS COMMENT BLOCK BEFORE MERGING TO MASTER !!!
 * Test scenarios:
 *
 * getInitialInlineConfig:
 *  - throws err if `storyId` isn't passed
 *  - should return null if infinite scroll collection doesn't exist, or it contains no stories
 *  - should remove current story from infinite scroll
 *  - should return a JSON in a format given here > https://amp.dev/documentation/components/amp-next-page/
 *  - the image should be thumbnail sized
 *  - take the first 'n' stories, set by itemsToTake (!)
 *
 * getResponse:
 *  - throw err if storyId isn't passed
 *  - should return null if infinite scroll collection doesn't exist, or it contains no stories
 *  - should remove current story from infinite scroll
 *  - omit the first 'n' stories, take the rest (!)
 *  - should return a JSON in a format given here > https://amp.dev/documentation/components/amp-next-page/
 */

class InfiniteScrollAmp {
  constructor({ ampConfig, client, publisherConfig, queryParams }) {
    this.client = client;
    this.publisherConfig = publisherConfig;
    this.queryParams = queryParams;
    this.collSlug = "amp-infinite-scroll"; // this is hardcoded to "amp-infinite-scroll" temporarily. Ideally it should come from ampConfig from platform
  }

  // eslint-disable-next-line class-methods-use-this
  getFilteredCollItems(coll, storyId) {
    console.log("coll >> ", coll)
    return coll.items.filter(
      ({ type, story }) =>
        type === "story" &&
        story["story-content-id"] !== storyId &&
        story.access !== "subscription"
    );
  }

  formatData({ itemsArr, type }) {
    // formats configuration as per need of amp infinite scroll
    const arr = itemsArr.map((item) => ({
      image: this.getImagePath(item),
      title: item.story.headline,
      url: `/amp/story/${item.story.slug}`,
    }));
    switch (type) {
      case "inline":
        return arr;
      default:
        return {
          pages: arr,
        };
    }
  }

  getImagePath(item) {
    const cdnImage = this.publisherConfig["cdn-image"];
    const s3Key = item.story["hero-image-s3-key"];
    const hostWithProtocol = /^https:\/\//.test(cdnImage)
      ? cdnImage
      : `https://${cdnImage}`;
    return `${hostWithProtocol}/${s3Key}?format=webp&w=250`;
  }

  async getResponse({ itemsTaken }) {
    const { "story-id": storyId } = this.queryParams;
    if (!storyId) return new Error(`Query param "story-id" missing`);
    const collection = await this.client.getCollectionBySlug(this.collSlug);
    if (!collection)
      return new Error(
        `Infinite scroll collection ${this.collSlug} returned falsy value`
      );
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(itemsTaken);
    const formattedData = this.formatData({ itemsArr: slicedItems });
    return JSON.stringify(formattedData);
  }

  async getInitialInlineConfig({ itemsToTake, storyId }) {
    if (!itemsToTake || !storyId)
      return new Error("Required params for getInitialInlineConfig missing");
    const collection = await this.client.getCollectionBySlug(this.collSlug);
    if (!collection || !collection.length) return null;
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(0, itemsToTake);
    const formattedData = this.formatData({
      itemsArr: slicedItems,
      type: "inline",
    });
    return JSON.stringify(formattedData);
  }
}

module.exports = InfiniteScrollAmp;
