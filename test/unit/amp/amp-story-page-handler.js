/* eslint-disable func-names */

const assert = require("assert");
const cloneDeep = require("lodash/cloneDeep");
const { ampStoryPageHandler } = require("../../../server/amp/handlers");

const ampConfig = {
  "related-collection-id": "related-stories-collection",
};

function getClientStub() {
  return {
    getHostname: () => "demo.quintype.io",
    getConfig: () =>
      Promise.resolve({
        memoizeAsync: (key, fn) => Promise.resolve(ampConfig),
      }),
    getStoryBySlug: (slug, params) =>
      Promise.resolve({
        story: {
          "story-content-id": 111,
          heading: "Dogecoin surges to $10 billion",
        },
      }),
    getCollectionBySlug: (slug) => {
      switch (slug) {
        case "related-stories-collection":
          return Promise.resolve({
            items: [{ type: "story", id: 123 }],
          });
        default:
          return Promise.resolve({});
      }
    },
  };
}

describe("ampStoryPageHandler", function () {
  it("Should not mutate opts", async function () {
    const dummyOpts = {
      featureConfig: {
        lorem: {
          ipsum: "abc",
        },
      },
    };
    const dummyOptsClone = cloneDeep(dummyOpts);
    const req = {
      url: "foo",
      params: "/story/slug",
    };
    const res = {
      redirect: () => null,
      set: () => null,
      send: () => null,
    };
    const next = () => null;
    const config = {
      memoizeAsync: (key, fn) => {
        return Promise.resolve(ampConfig);
      },
    };
    await ampStoryPageHandler(req, res, next, {
      client: getClientStub(),
      config,
      domainSlug: null,
      seo: "",
      additionalConfig: "something",
      ...dummyOpts,
    });
    assert.deepStrictEqual(dummyOptsClone, dummyOpts);
  });
});
