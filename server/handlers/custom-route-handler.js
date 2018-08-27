const urlLib = require("url");
const {createStore} = require("redux");
const Promise = require("bluebird");
const get = require("lodash/get");

const { CustomPath } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { customUrlToCacheKey } = require("../caching");

function writeStaticPageResponse(res, url, page, data, { config, renderLayout, seo }) {
  // const menu = get(config, ["layout", "menu"], []);
  // const sections = get(config, ["sections"], []);
  const store = createStore((state) => state, {
    qt: {
      pageType: page.type,
      data: Object.assign({}, page, data),
      config: config.config,
      currentPath: `${url.pathname}${url.search || ""}`,
      disableIsomorphicComponent: true
    }
  });

  const seoInstance = (typeof seo == 'function') ? seo(config) : seo;
  const seoTags = seoInstance && seoInstance.getMetaTags(config, page.type, {}, {url});

  res.status(page["status-code"] || 200);
  
  return renderLayout(res, {
    content: page.content,
    store: store,
    seoTags: seoTags,
    disableAjaxNavigation: true,
  });
}

exports.customRouteHandler = function customRouteHandler(req, res, next, { config, client, loadData, loadErrorData, renderLayout, logError, seo }) {
  const url = urlLib.parse(req.url, true);
  return CustomPath.getCustomPathData(client, req.params[0])
    .then(page => {
      if(!page) {
        return next();
      }
      
      addCacheHeadersToResult(res, [customUrlToCacheKey(config["publisher-id"], url["pathname"])]);

      if(page.type === 'redirect') {
        if(!page["status-code"] || !page["destination-path"]) {
          logError('Defaulting the status-code to 302 with destination-path as home-page');
        }

        return res.redirect(page["status-code"] || 302, page["destination-path"] || "/");
      }

      if(page.type === 'static-page') {
        if(page.metadata.header || page.metadata.footer) {
          return loadData('custom-static-page', {}, config, client)
            .then(response => {
              return writeStaticPageResponse(res, url, page.page, response.data, { config, renderLayout, seo });
            })
            .catch(error => {
              logError(error);
              return loadErrorData(error, config, client);
            });
        }
        return res.send(page.content);
      }

      return next();
    }).catch(e => {
      logError(e);
      res.status(500);
      res.send(e.message);
    }).finally(() => res.end());
}