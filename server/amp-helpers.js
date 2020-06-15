class InfiniteScrollData {
  constructor({ storyId, ampConfig, client, publisherConfig }) {
    this.storyId = storyId;
    this.ampConfig = ampConfig;
    this.client = client;
    this.publisherConfig = publisherConfig;
  }

  getFilteredCollItems(coll) {
    // removes current story from infinite scroll collection items
    return coll.items.filter(
      (item) =>
        item.type === "story" && item.story["story-content-id"] !== this.storyId
    );
  }

  buildObj(collItems) {
    // builds configuration obj thats needed for amp infinite scroll
    // {
    //   "image": "https://example.com/image1.jpg",
    //   "title": "This article shows first",
    //   "url": "https://example.com/article1.amp.html"
    // }
    const pages = collItems.map((item) => ({
      image: this.getImagePath(item),
      title: item.story.headline,
      // url: item.story.url,
      url: `/amp/story/${item.story.slug}`,
    }));
    return { pages };
  }

  getImagePath(item) {
    const cdnImage = this.publisherConfig["cdn-image"];
    const s3Key = item.story["hero-image-s3-key"];
    const hostWithProtocol = /^https:\/\//.test(cdnImage)
      ? cdnImage
      : `https://${cdnImage}`;
    return `${hostWithProtocol}/${s3Key}?format=webp&w=250`;
  }

  async getJson() {
    // const collId = this.ampConfig["infinite-scroll-collection-id"];
    // const collId = this.ampConfig["related-collection-id"];
    const collId = "india-news"; // REMOVE THIS!!
    if (!collId)
      return new Error(
        `"infinite-scroll-collection-id" not specified in amp config`
      );
    const collection = await this.client.getCollectionBySlug(collId);
    if (!collection)
      return new Error(
        `Infinite scroll collection ${collId} returned falsy value`
      );
    const filteredItems = this.getFilteredCollItems(collection);
    const formattedObj = this.buildObj(filteredItems);
    return JSON.stringify(formattedObj);
  }
}

module.exports = { InfiniteScrollData };
