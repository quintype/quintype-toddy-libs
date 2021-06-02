const { get } = require("lodash");
const axios = require("axios");

exports.registerFCMTopic = async function registerFCM(
  req,
  res,
  next,
  { config, client, publisherConfig }
) {
  const token = get(req, ["body", "token"], null);
  if (!token) {
    res.status(400).send("No Token Found");
    return;
  }

  const serverKey = get(publisherConfig, ["fcm", "serverKey"], null);
  if (!serverKey) {
    res.status(500).send("Server Key is not available");
    return;
  }
  const url = `https://iid.googleapis.com/iid/v1/${token}/rel/topics/all`;
  try {
    await axios.post({
      url,
      headers: {
        Authorization: `key=${serverKey}`,
        "content-type": "application/json",
      },
      timeout: config.timeout || 4000,
    });
    res.status(200).send("Registration Done Successfully");
    return;
  } catch (error) {
    res.status(500).send("FCM Subscription Failed");
    return;
  }
};
