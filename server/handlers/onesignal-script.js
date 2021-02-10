const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const partialTemplateStr = fs.readFileSync(
  path.join(__dirname, "../views/partial/one-signal.ejs"),
  {
    encoding: "utf-8",
  }
);

const partialTemplate = ejs.compile(partialTemplateStr);

exports.getOneSignalScript = function getOneSignalScript({
  config,
  // eslint-disable-next-line global-require
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

  const renderedContent = partialTemplate({
    appId,
    safariWebId,
    publisherName,
  });

  return renderedContent;
};
