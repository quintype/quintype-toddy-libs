var assert = require("assert");
const {
  getOneSignalScript,
} = require("../../server/handlers/onesignal-script");

describe("OneSignal", function () {
  const config = {
    "public-integrations": {
      "one-signal": {
        "app-id": "5874asd9-as-sdsd-a6fe-sadafsfasd",
      },
    },
    "publisher-name": "malibu",
  };

  it("should not break if onesignal config is not availabe in publisher config", async () => {
    const publisherConfig = {
      publisher: {
        onesignal: {},
      },
    };
    const oneSignalScriptWithNoConfig = await getOneSignalScript({
      config,
      publisherConfig,
    });
    assert.equal(null, oneSignalScriptWithNoConfig);
  });

  it("should not render onesignal script if is_enable is set to false", async () => {
    const publisherConfig = {
      publisher: {
        onesignal: {
          safari_web_id: "some-randome-id",
          is_enable: false,
        },
      },
    };

    const oneSignalScriptWithNotEnable = await getOneSignalScript({
      config,
      publisherConfig,
    });
    assert.equal(null, oneSignalScriptWithNotEnable);
  });

  it("should render onesignal script if is_enabled", async () => {
    const publisherConfig = {
      publisher: {
        onesignal: {
          safari_web_id: "some-randome-id",
          is_enable: true,
        },
      },
    };

    const oneSignalScriptWithEnable = await getOneSignalScript({
      config,
      publisherConfig,
    });
    assert.notEqual(null, oneSignalScriptWithEnable);
  });
});
