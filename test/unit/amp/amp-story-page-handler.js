/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */

const assert = require("assert");
const cloneDeep = require("lodash/cloneDeep");
const { ampStoryPageHandler } = require("../../../server/amp/handlers");

const ampConfig = {
  "related-collection-id": "related-stories-collection",
};

function getClientStub({
  getStoryBySlug = (slug, params) =>
    Promise.resolve({
      story: {
        "is-amp-supported": true,
        "story-content-id": 111,
        heading: "Dogecoin surges to $10 billion",
      },
    }),
  getCollectionBySlug = (slug) => {
    switch (slug) {
      case "related-stories-collection":
        return Promise.resolve({
          items: [{ type: "story", id: 123 }],
        });
      default:
        return Promise.resolve({});
    }
  },
} = {}) {
  const clientObj = {
    getStoryBySlug,
    getCollectionBySlug,
  };
  return clientObj;
}
const dummyReq = {
  url: "foo",
  params: "/story/slug",
};
const dummyRes = {
  redirect: () => null,
  set: () => null,
  send: () => null,
};
const dummyNext = () => null;
const dummyConfig = {
  memoizeAsync: (key, fn) => {
    if (key === "amp-config") return Promise.resolve(ampConfig);
    throw new Error(`memoizeAsync not mocked for key ${key}`);
  },
};
class DummyInfiniteScrollAmp {
  getInitialInlineConfig() {
    return null;
  }
}

describe("ampStoryPageHandler unit tests", function () {
  it("Should not mutate opts", async function () {
    const dummyOpts = {
      featureConfig: {
        lorem: {
          ipsum: "abc",
        },
      },
    };
    const dummyOptsClone = cloneDeep(dummyOpts);
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub(),
      config: dummyConfig,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
      ...dummyOpts,
    });
    assert.deepStrictEqual(dummyOptsClone, dummyOpts);
  });
  it("should not mutate req, res, client, config", async function () {
    const client1 = getClientStub();
    const client2 = cloneDeep(client1);
    const config1 = dummyConfig;
    const config2 = cloneDeep(config1);
    const req1 = dummyReq;
    const req2 = cloneDeep(req1);
    const res1 = dummyRes;
    const res2 = cloneDeep(res1);
    await ampStoryPageHandler(req1, res1, dummyNext, {
      client: client1,
      config: config1,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
    });
    assert.deepStrictEqual(client1, client2);
    assert.deepStrictEqual(config1, config2);
    assert.deepStrictEqual(req1, req2);
    assert.deepStrictEqual(res1, res2);
  });
  it("should call the next middleware if story not found", async function () {
    let nextCalled = false;
    const dummyNext = () => {
      nextCalled = true;
    };
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub({
        getStoryBySlug: () => Promise.resolve({}),
      }),
      config: dummyConfig,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
    });
    assert.strictEqual(nextCalled, true);
  });
  it("should pass related stories to amplib if present", async function () {
    let relatedStories;
    const dummyAmpLib = {
      ampifyStory: (params) => {
        const relStories = params.opts.featureConfig.relatedStories.stories;
        if (relStories.length) relatedStories = JSON.stringify(relStories);
      },
      unsupportedStoryElementsPresent: () => false,
    };
    const dummyConfig2 = {
      memoizeAsync: (key, fn) =>
        Promise.resolve({
          "related-collection-id": "dummy-related-collection",
        }),
    };
    const dummyRelatedStoriesCollection = {
      items: [
        {
          type: "story",
          id: 111,
          heading: "Dogecoin surges to $10 billion",
          story: "Dogecoin surges to $10 billion",
        },
        {
          type: "story",
          id: 112,
          story: "Elon musk sells tweet as NFT for $2 million",
        },
        {
          type: "story",
          id: 113,
          story: "SpaceX Starship SN10 lands successfully",
        },
      ],
    };
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub({
        getCollectionBySlug: (slug) => {
          if (slug === "dummy-related-collection")
            return Promise.resolve(dummyRelatedStoriesCollection);
          throw new Error(`getCollectionBySlug not mocked for ${slug}`);
        },
      }),
      config: dummyConfig2,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
      ampLibrary: dummyAmpLib,
      InfiniteScrollAmp: DummyInfiniteScrollAmp,
    });
    // passes related stories to amplib
    assert.strictEqual(
      relatedStories,
      JSON.stringify([
        "Elon musk sells tweet as NFT for $2 million",
        "SpaceX Starship SN10 lands successfully",
      ])
    );
    // removes current story from related stories
    assert.strictEqual(
      false,
      /Dogecoin surges to \$10 billion/.test(relatedStories)
    );
  });
  it("should not pass related stories to amplib if absent", async function () {
    let relatedStories;
    const dummyAmpLib = {
      ampifyStory: (params) => {
        const relStories = params.opts.featureConfig.relatedStories.stories;
        if (relStories.length) relatedStories = JSON.stringify(relStories);
      },
      unsupportedStoryElementsPresent: () => false,
    };
    const dummyConfig2 = {
      memoizeAsync: (key, fn) =>
        Promise.resolve({
          "related-collection-id": null,
        }),
    };
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub(),
      config: dummyConfig2,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
      ampLibrary: dummyAmpLib,
      InfiniteScrollAmp: DummyInfiniteScrollAmp,
    });
    assert.strictEqual(relatedStories, undefined);
  });
  it("should call seo function with pageType == 'story-page-amp' if passed from FE", async function () {
    let isCorrectPageType = false;
    let seoPassedToAmpLib;
    const dummySeo = (config, pageType) => {
      if (pageType === "story-page-amp") isCorrectPageType = true;
      return {
        getMetaTags: () => {
          return {
            toString: () => "this is the seo string",
          };
        },
      };
    };
    const dummyAmpLib = {
      ampifyStory: (params) => {
        seoPassedToAmpLib = params.seo;
      },
      unsupportedStoryElementsPresent: () => false,
    };
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub(),
      config: dummyConfig,
      domainSlug: null,
      seo: dummySeo,
      additionalConfig: "something",
      ampLibrary: dummyAmpLib,
      InfiniteScrollAmp: DummyInfiniteScrollAmp,
    });
    assert.strictEqual(isCorrectPageType, true);
    assert.strictEqual(seoPassedToAmpLib, "this is the seo string");
  });
  // this is failing
  it("should call getAdditionalConfig method if it's passed from FE; pass it on to amplib as additionalConfig", async function () {
    let getAdditionalConfigCalled = false;
    async function dummyGetAdditionalConfig(params) {
      return new Promise((resolve) => {
        setTimeout(() => {
          getAdditionalConfigCalled = true;
          resolve({ some: "value" });
        }, 15);
      });
    }
    const dummyOpts = {
      getAdditionalConfig: dummyGetAdditionalConfig,
    };
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub(),
      config: dummyConfig,
      domainSlug: null,
      seo: "",
      additionalConfig: { sideNote: "this contains bk config by default" },
      InfiniteScrollAmp: DummyInfiniteScrollAmp,
      ...dummyOpts,
    });
    assert.strictEqual(getAdditionalConfigCalled, true);
  });
});
