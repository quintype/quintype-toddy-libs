const { get } = require("lodash");
const request = require("request-promise");

exports.registerFCMTopic = function registerFCM(req, res, next, { config, client }) {
  const token = get(req, ["body", "token"], null);
  if (!token) {
    res.status(404).send("No Token Found");
    return;
  }

  const serverKey = `key=${get(config, ["public-integrations", "fcm", "app-key"], null) ||
    "AAAAhEWmCNs:APA91bE5D1kqGUL_X4kvArGTViO-b-sNhus00hKJQH4_P_CxFXlR2umt0IglpeZppmCTq-XlCnQrUvngZMoyfetE6GFPFpA7K4nqaKd8OremvVpt4ZXyLnIErzgcAY09Lk55IlTn4lz6iIH81IcAb4k3qPDaWPD84w"}`;
  const url = `https://iid.googleapis.com/iid/v1/${token}/rel/topics/all`;
  request({
    uri: url,
    method: "POST",
    headers: {
      Authorization: serverKey,
      "content-type": "application/json"
    }
  })
    .then(() => res.status(200).send("Registration Done Suceessfuly"))
    .catch(error => {
      res.status(404).send(error);
    });
}
