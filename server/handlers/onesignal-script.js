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
  publisherConfig = {},
}) {
  const appId =
    (config["public-integrations"]["one-signal"] &&
      config["public-integrations"]["one-signal"]["app-id"]) ||
    null;

  const onesignalConfig = publisherConfig.publisher && publisherConfig.publisher.onesignal

  // will take safariWebId from public integration once bold have option to put safari id.
  const safariWebId = (onesignalConfig && onesignalConfig.safari_web_id) || null;
  const isEnable = (onesignalConfig && onesignalConfig.is_enable) || false;
  const publisherName = config["publisher-name"] || "malibu";
  const timeOut = (onesignalConfig && onesignalConfig.time_out) || 4000;
  const renderedContent = isEnable
    ? partialTemplate({
        appId,
        safariWebId,
        publisherName,
        timeOut,
      })
    : null;

  return renderedContent;
};
