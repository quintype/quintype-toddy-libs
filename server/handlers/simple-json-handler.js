function simpleJsonHandler(req, res, next, {config, jsonData}) {
  return res.header("Cache-Control", "public,max-age=300")
            .header("Vary", "Accept-Encoding")
            .json(jsonData(config));
}

exports.simpleJsonHandler = simpleJsonHandler;
