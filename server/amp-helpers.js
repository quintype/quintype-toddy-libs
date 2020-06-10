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
    return collItems.map((item) => ({
      image: `${this.publisherConfig["cdn-image"]}/${item.story["hero-image-s3-key"]}?format=webp&w=250`,
      title: item.story.headline,
      url: item.story.url,
    }));
  }

  async getJson() {
    // const collId = this.ampConfig["infinite-scroll-collection-id"];
    const collId = "india-news"; // REMOVE THIS!!
    if (!collId)
      return new Error(
        `"infinite-scroll-collection-id" not specified in amp config`
      );
    const collection = await this.client.getCollectionBySlug(collId);
    const filteredItems = this.getFilteredCollItems(collection);
    const formattedObj = this.buildObj(filteredItems);
    return JSON.stringify(formattedObj);
  }
}

module.exports = { InfiniteScrollData };
