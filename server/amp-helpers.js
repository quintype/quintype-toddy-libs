class InfiniteScrollData {
  constructor({ storyId, ampConfig, client, publisherConfig, start, end }) {
    this.storyId = storyId;
    this.ampConfig = ampConfig;
    this.client = client;
    this.publisherConfig = publisherConfig;
    this.start = start;
    this.end = end;
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
    const pages = collItems.map((item) => ({
      image: this.getImagePath(item),
      title: item.story.headline,
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
    const collId = this.ampConfig["related-collection-id"]; // !!!! change to infinite-scroll-collection-id later
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
    const slicedItems = filteredItems.slice(this.start, this.end);
    const formattedObj = this.buildObj(slicedItems);
    return JSON.stringify(formattedObj);
  }
}

function setCorsHeaders({ req, res, publisherConfig }) {
  // https://amp.dev/documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/
  // const { origin, "amp-same-origin": ampSameOrigin } = req.headers;
  // const ampCacheHost = publisherConfig["sketches-host"]
  //   .replace(/-/g, "--")
  //   .replace(/\./g, "-");
  // const whiteList = [
  //   publisherConfig["sketches-host"],
  //   `${ampCacheHost}.cdn.ampproject.org`,
  //   `${ampCacheHost}.www.bing-amp.com`,
  // ];
  // if ((!origin && ampSameOrigin) || whiteList.includes(origin))
  //   res.set("Access-Control-Allow-Origin", origin);
  // else res.status(401).send(`Origin ${origin} not whitelisted`);
  //
  res.set("Access-Control-Allow-Origin", "*"); // TEMPORARY
}

module.exports = { InfiniteScrollData, setCorsHeaders };
