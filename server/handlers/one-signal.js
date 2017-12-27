exports.oneSignalServiceWorker = function(req, res, {token = "v0"}) {
  res.status(200)
     .header("Content-Type", "text/javascript")
     .header("Cache-Control", "public,max-age=300")
     .header("Vary", "Accept-Encoding")
     .send(`importScripts('/service-worker.js?${token}');importScripts('https://cdn.onesignal.com/sdks/OneSignalSDK.js');`)
}
