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
  it("should not mutate req, res, client, config", async function() {
    const client1 = getClientStub()
    const client2 = cloneDeep(client1)
    const config1 = dummyConfig;
    const config2 = cloneDeep(config1)
    const req1 = dummyReq
    const req2 = cloneDeep(req1)
    const res1 = dummyRes
    const res2 = cloneDeep(res1)
    await ampStoryPageHandler(req1, res1, dummyNext, {
      client: client1,
      config: config1,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
    });
    assert.deepStrictEqual(client1, client2)
    assert.deepStrictEqual(config1, config2)
    assert.deepStrictEqual(req1, req2)
    assert.deepStrictEqual(res1, res2)
  })
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
