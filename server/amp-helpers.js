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

  buildObj({ itemsArr, nextHost, firstTakeCount, storyId }) {
    // builds configuration obj thats needed for amp infinite scroll
    const pages = itemsArr.map((item) => ({
      image: this.getImagePath(item),
      title: item.story.headline,
      url: `/amp/story/${item.story.slug}`,
    }));
    return {
      pages,
      next: `${nextHost}/amp/api/v1/amp-infinite-scroll-next?story-id=${storyId}&items-taken-count=${firstTakeCount}`,
    };
  }

  buildNextObj(itemsArr) {
    const pages = itemsArr.map((item) => ({
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
    const {
      "story-id": storyId,
      "first-take-count": firstTakeCountQueryParam,
      "next-host": nextHost,
    } = this.queryParams;
    const firstTakeCount = firstTakeCountQueryParam || 5;
    if (!nextHost) return new Error(`Query param "next-host" missing`);
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
    const slicedItems = filteredItems.slice(0, firstTakeCount);
    const formattedObj = this.buildObj({
      itemsArr: slicedItems,
      nextHost,
      firstTakeCount,
      storyId,
    });
    return JSON.stringify(formattedObj);
  }

  async getNext() {
    const {
      "story-id": storyId,
      "items-taken-count": itemsTakenCount,
    } = this.queryParams;
    if (!storyId) return new Error(`Query param "story-id" missing`);
    if (!itemsTakenCount)
      return new Error(`Query param "items-taken-count" missing`);
    if (!this.collId)
      return new Error(
        `"infinite-scroll-collection-id" not specified in amp config`
      );
    const collection = await this.client.getCollectionBySlug(this.collId);
    const filteredItems = this.getFilteredCollItems(collection, storyId);
    const slicedItems = filteredItems.slice(itemsTakenCount);
    const formattedObj = this.buildNextObj(slicedItems);
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

module.exports = { InfiniteScrollAmp, setCorsHeaders };
