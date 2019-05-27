const assert = require('assert');
const express = require("express");
const supertest = require("supertest");
const firebase  = require("firebase");
const bodyParser = require("body-parser");
const { get } = require("lodash");
const { registerFCMTopic } = require("../../server/handlers/fcm-registration-handler");
const { isomorphicRoutes } = require("../../server/routes");

function getClientStub(hostname) {
    return {
      getHostname: () => "demo.quintype.io",
      getConfig: () => Promise.resolve({config: {foo: "bar", "theme-attributes": {}}, "publisher-id": 42}),
    };
}

function registerFCMTopicStub(req, res, next) {
    const token = get(req, ["body", "token"], null);
    if (token && token === "testToken") {
        return res.status(200).send("Success");
    } else {
        return res.status(404);
    }
}

function createApp(loadData, opts = {}) {
    const app = express();
    isomorphicRoutes(app, Object.assign({
      assetHelper: {assetHash: (file) => file == "app.js" ? "abcdef" : null},
      getClient: getClientStub,
      generateRoutes: () => opts.routes || [{path: "/", pageType: "home-page"}],
      loadData,
      appVersion: 42,
      publisherConfig: opts.publisherConfig || {},
    }, opts));
    app.post("/register-fcm-topic-test",bodyParser.json(), registerFCMTopicStub);
    return app;
}

describe("Register to a topic", function() {
    it("Make a request to /register-fcm-topic" , async function(done) {
        const token = 'testToken';
        const app= createApp();
        supertest(app)
        .post("/register-fcm-topic-test")
        .send({token: token})
        .expect(200)
        .then((res)=> res)
        .catch(console.log);
        done()

    })
})