function simpleJsonHandler(req, res, next, { config, jsonData }) {
  return res
    .header("Cache-Control", "public,max-age=300")
    .header("Vary", "Accept-Encoding")
    .header("Access-Control-Allow-Origin", "*")
    .header("Content-Security-Policy", "default-src * data: blob: 'self'; script-src fea.assettype.com assets.prothomalo.com adservice.google.com adservice.google.co.in cdn.ampproject.org tpc.googlesyndication.com localhost:8080 www.google-analytics.com www.googletagmanager.com clientcdn.pushengage.com certify-js.alexametrics.com securepubads.g.doubleclick.net 'unsafe-inline' 'unsafe-eval' blob: data: 'self';style-src data: blob: 'unsafe-inline' *;")
    .json(jsonData(config));
}

exports.simpleJsonHandler = simpleJsonHandler;
