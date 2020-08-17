const assert = require("assert");
const express = require('express');
const supertest = require("supertest");
const {
  isomorphicRoutes
} = require("../../server/routes");


const getClientStub = (hostname) => {
  return {
    getHostname: () => hostname,
    getConfig: () =>
      Promise.resolve({
        "publisher-settings": {
          title: "Madrid"
        }
      }),
  };
};

const configWrapperStub = config => {
  return {
    ...config,
    extendedConfig: {
      "foo": "bar"
    }
  };
};

const loadDataStub = (pageType, params, config, client) =>
  Promise.resolve({
    data: {
      pageType,
      config
    },
  });

describe("configWrapper", () => {
  it("if passed extends the existing config", (done) => {
    const app = express();
    isomorphicRoutes(
      app,
      Object.assign({
        assetHelper: {},
        getClient: getClientStub,
        generateRoutes: () => ([{
          path: "/",
          pageType: "home-page"
        }]),
        loadData: loadDataStub,
        publisherConfig: {},
        configWrapper: configWrapperStub,
      })
    );

    supertest(app)
      .get("/route-data.json")
      .then((res) => {
        const response = JSON.parse(res.text);
        assert.equal("bar", response.data.config.extendedConfig.foo);
      })
      .then(done);
  });
});

describe("configWrapper", () => {
  it("if not passed returns the existing config", (done) => {
    const app = express();
    isomorphicRoutes(
      app,
      Object.assign({
        assetHelper: {},
        getClient: getClientStub,
        generateRoutes: () => ([{
          path: "/",
          pageType: "home-page"
        }]),
        loadData: loadDataStub,
        publisherConfig: {},
      })
    );

    supertest(app)
      .get("/route-data.json")
      .then((res) => {
        const response = JSON.parse(res.text);
        assert.equal(undefined, response.data.config.extendedConfig);
        assert.equal("Madrid", response.data.config['publisher-settings'].title);
      })
      .then(done);
  });
});
