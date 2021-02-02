exports.getOneSignalScript = function getOneSignalScript({
  config,
  publisherConfig = require("../publisher-config"),
}) {
  const appId =
    (config["public-integrations"]["one-signal"] &&
      config["public-integrations"]["one-signal"]["app-id"]) ||
    null;

  // will take safariWebId from public integration once bold have option to put safari id.
  const safariWebId =
    publisherConfig.publisher &&
    publisherConfig.publisher.onesignal &&
    publisherConfig.publisher.onesignal.safari_web_id;

  const publisherName = config["publisher-name'"] || "malibu";

  return `var OneSignal = OneSignal || [];

  OneSignal.push(function () {
    OneSignal.init({
      appId: "${appId}",
      safari_web_id: "${safariWebId}",
      autoRegister: true,
      notifyButton: {
        enable: true,
      },
    });
  });
  OneSignal.push(function () {
    OneSignal.sendTag(
      "<%= ${publisherName} %>-breaking-news",
      "true"
    ).then(function (tagsSent) {
      console.info("Onesignal tags sent --> ", tagsSent);
    });
  })`;
};
