exports.handleIsomorphicShell = function handleIsomorphicShell(req, res, {config, renderLayout}) {
  if(req.query["_workbox-precaching"] && req.query["_workbox-precaching"] != assetHash("app.js"))
    return res.status(503)
              .send("Requested Shell Is Not Current");

  res.status(200).setHeader("Cache-Control", "public,max-age=900");
  renderLayout(res, {
    content: '<div class="app-loading"></div>',
    store: createStore((state) => state, {
      qt: {config: config}
    })
  });
}
