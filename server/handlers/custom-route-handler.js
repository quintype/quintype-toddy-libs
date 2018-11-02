const urlLib = require("url");
const { createStore } = require("redux");
const Promise = require("bluebird");
const get = require("lodash/get");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const staticPageTemplateStr = fs.readFileSync(
  path.join(__dirname, "../views/static-page.ejs"),
  { encoding: "utf-8" }
);
const staticPageTemplate = ejs.compile(staticPageTemplateStr);

const { CustomPath } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");

function renderStaticPageContent(store, content) {
  const renderedContent = staticPageTemplate({ store, content });

  return renderedContent;
}

function writeStaticPageResponse(
  res,
  url,
  page,
  data,
  { config, renderLayout, seo }
) {
  const store = createStore(state => state, {
    qt: {
      pageType: page.type,
      data: Object.assign({}, page, data.data),
      config: data.config,
      currentPath: `${url.pathname}${url.search || ""}`,
      disableIsomorphicComponent: true
    }
  });

  const seoInstance = typeof seo === "function" ? seo(config) : seo;
  const seoTags =
    seoInstance && seoInstance.getMetaTags(config, page.type, {}, { url });

  res.status(page["status-code"] || 200);

  return renderLayout(res, {
    title: page.title,
    content: renderStaticPageContent(store, page.content),
    store: store,
    seoTags: seoTags,
    disableAjaxNavigation: true
  });
}

exports.customRouteHandler = function customRouteHandler(
  req,
  res,
  next,
  { config, client, loadData, loadErrorData, renderLayout, logError, seo }
) {
  const url = urlLib.parse(req.url, true);
  const path = req.params[0];
  return CustomPath.getCustomPathData(client, path)
    .then(page => {
      if (!page) {
        return next();
      }

      if (page.type === "redirect") {
        if (!page["status-code"] || !page["destination-path"]) {
          logError(
            "Defaulting the status-code to 302 with destination-path as home-page"
          );
        }
        addCacheHeadersToResult(res, page.cacheKeys(config["publisher-id"]));

        return res.redirect(
          page["status-code"] || 302,
          page["destination-path"] || "/"
        );
      }

      if (page.type === "static-page") {
        addCacheHeadersToResult(res, page.cacheKeys(config["publisher-id"]));

        if (page.metadata.header || page.metadata.footer) {
          return loadData("custom-static-page", {}, config, client, {
            host: req.hostname
          }).then(response => {
            return writeStaticPageResponse(res, url, page.page, response, {
              config,
              renderLayout,
              seo
            });
          });
        }
        return res.send(page.content);
      }

      return next();
    })
    .catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    });
};
