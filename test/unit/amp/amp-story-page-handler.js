/* eslint-disable func-names */

const assert = require("assert");
const cloneDeep = require("lodash/cloneDeep");
const { ampStoryPageHandler } = require("../../../server/amp/handlers");

const ampConfig = {
  "related-collection-id": "related-stories-collection",
};

function getClientStub({
  getHostname = () => "demo.quintype.io",
  getConfig = () =>
    Promise.resolve({
      memoizeAsync: (key, fn) => Promise.resolve(ampConfig),
    }),
  getStoryBySlug = (slug, params) =>
    Promise.resolve({
      story: {
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
    getHostname,
    getConfig,
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
    return Promise.resolve(ampConfig);
  },
};

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
  it("should call the next middleware if story not found", async function () {
    let nextCalled = false;
    const dummyNext = () => {
      nextCalled = true;
    }
    await ampStoryPageHandler(dummyReq, dummyRes, dummyNext, {
      client: getClientStub({
        getStoryBySlug: () => Promise.resolve({})
      }),
      config: dummyConfig,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
    });
    assert.strictEqual(nextCalled, true);
  });
});
