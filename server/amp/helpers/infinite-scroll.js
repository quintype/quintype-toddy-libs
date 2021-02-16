class InfiniteScrollAmp {
  constructor({ ampConfig, client, publisherConfig, queryParams }) {
    this.client = client;
    this.publisherConfig = publisherConfig;
    this.queryParams = queryParams;
    this.inlineStoriesTaken = 5; // sets stories given as inline config. Has to be > 0 as we are using this to check if infinite scroll exists in amplib
    this.collSlug = "amp-infinite-scroll"; // this is hardcoded to "amp-infinite-scroll" temporarily. Ideally it should come from ampConfig from platform
  }

  // eslint-disable-next-line class-methods-use-this
  getFilteredCollItems(coll, storyId) {
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

  async getResponse() {
    const { "story-id": storyId } = this.queryParams;
    if (!storyId) return new Error(`Query param "story-id" missing`);
    const collection = await this.client.getCollectionBySlug(this.collSlug);
    if (!collection)
      return new Error(
        `Infinite scroll collection ${this.collSlug} returned falsy value`
      );
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(this.inlineStoriesTaken);
    const formattedData = this.formatData({ itemsArr: slicedItems });
    return JSON.stringify(formattedData);
  }

  async getInitialInlineConfig({ storyId }) {
    const collection = await this.client.getCollectionBySlug(this.collSlug);
    if (!collection) return null;
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(0, this.inlineStoriesTaken);
    const formattedData = this.formatData({
      itemsArr: slicedItems,
      type: "inline",
    });
    return JSON.stringify(formattedData);
  }
}

module.exports = { InfiniteScrollAmp };
