const { get } = require("lodash");
const request = require("request-promise");

exports.registerFCMTopic = function registerFCM(req, res, next, { config, client, publisherConfig }) {
    const token = get(req, ["body", "token"], null);
    if (!token) {
        res.status(404).send("No Token Found");
        return;
    }

    const serverKey = get(publisherConfig, ["fcm", "serverKey"], null) ;
    if ( ! serverKey ) {
        res.status(500).send("Server Key is not available");
        return;
    }
    const url = `https://iid.googleapis.com/iid/v1/${token}/rel/topics/all`;
    request({
        uri: url,
        method: "POST",
        headers: {
        Authorization: `key=${serverKey}`,
        "content-type": "application/json"
        }
    })
    .then(() => res.status(200).send("Registration Done Suceessfuly"))
    .catch(error => {
        res.status(500).send("FCM Subscription Failed");
        return;
    });
}
