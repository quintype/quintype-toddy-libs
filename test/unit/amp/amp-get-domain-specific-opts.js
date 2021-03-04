const assert = require("assert");
const { getDomainSpecificOpts } = require("../../../server/amp/helpers");

describe("getDomainSpecificOpts helper function", function () {
  const opts = {
    seo: "lol",
    slots: {
      lorem: "ipsum",
      dolar: "si",
    },
    featureConfig: {
      enableAds: {
        default: {
          top: true,
          body: false,
        },
      },
    },
    domains: {
      // contains opts for various subdomains
      entertainment: {
        featureConfig: {
          enableAds: {
            default: {
              top: false,
            },
            liveBlog: {
              bottom: false,
              top: true,
            },
          },
        },
      },
    },
  };

  const optsForEntertainment = {
    seo: "lol",
    slots: {
      lorem: "ipsum",
      dolar: "si",
    },
    featureConfig: {
      enableAds: {
        default: {
          top: false,
          body: false,
        },
        liveBlog: {
          bottom: false,
          top: true,
        },
      },
    },
  };

  it("Should return correct opts for subdomain", function () {
    assert.deepStrictEqual(
      optsForEntertainment,
      getDomainSpecificOpts(opts, "entertainment")
    );
  });
  it("Should return correct opts for main domain", function () {
    assert.deepStrictEqual(opts, getDomainSpecificOpts(opts, null));
  });
});
