class InfiniteScrollAmp {
  constructor({ ampConfig, client, publisherConfig, queryParams }) {
    this.client = client;
    this.publisherConfig = publisherConfig;
    this.queryParams = queryParams;
    this.collId = ampConfig["related-collection-id"]; // !!!! change to infinite-scroll-collection-id later
  }

  // eslint-disable-next-line class-methods-use-this
  getFilteredCollItems(coll, storyId) {
    // removes current story from infinite scroll collection items
    return coll.items.filter(
      (item) =>
        item.type === "story" && item.story["story-content-id"] !== storyId
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
    if (!this.collId)
      return new Error(
        `"infinite-scroll-collection-id" not specified in amp config`
      );
    const collection = await this.client.getCollectionBySlug(this.collId);
    if (!collection)
      return new Error(
        `Infinite scroll collection ${this.collId} returned falsy value`
      );
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(itemsTaken);
    const formattedData = this.formatData({ itemsArr: slicedItems });
    return JSON.stringify(formattedData);
  }

  async getInitialInlineConfig({ itemsToTake, storyId }) {
    if (!itemsToTake || !storyId)
      return new Error("Required params for getInitialInlineConfig missing");
    const collection = await this.client.getCollectionBySlug(this.collId);
    if (!collection)
      return new Error(
        `Infinite scroll collection ${this.collId} returned falsy value`
      );
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(0, itemsToTake);
    const formattedData = this.formatData({
      itemsArr: slicedItems,
      type: "inline",
    });
    return JSON.stringify(formattedData);
  }
}

function setCorsHeaders({ req, res, publisherConfig }) {
  // https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/
  const { origin, "amp-same-origin": ampSameOrigin } = req.headers;
  const ampCacheHost = publisherConfig["sketches-host"]
    .replace(/-/g, "--")
    .replace(/\./g, "-");
  const whiteList = [
    publisherConfig["sketches-host"],
    `${ampCacheHost}.cdn.ampproject.org`,
    `${ampCacheHost}.www.bing-amp.com`,
  ];
  if (!origin && ampSameOrigin) {
    // allow same origin
    res.set("Access-Control-Allow-Origin", "*");
  } else if (whiteList.includes(origin)) {
    // allow whitelisted origins
    res.set("Access-Control-Allow-Origin", origin);
  } else res.status(401).send(`Unauthorized`);
}

module.exports = { InfiniteScrollAmp, setCorsHeaders };