const urlLib = require("url");
const {createStore} = require("redux");

const { CustomPath } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");

function writeStaticPageResponse(res, page, { config, renderLayout, seo, getNavigationMenuArray }) {
  const store = createStore((state) => state, {
    qt: {
      pageType: page.type,
      data: Object.assign({}, page.page, {navigationMenu: getNavigationMenuArray(config.layout.menu, config.sections)}),
      config: config.config,
      currentPath: `${url.pathname}${url.search || ""}`,
      disableIsomorphicComponent: true
    }
  });

  const seoInstance = (typeof seo == 'function') ? seo(config) : seo;
  const seoTags = seoInstance && seoInstance.getMetaTags(config, page.type, {}, {url});
  
  const cacheKeys = ["static"];
  addCacheHeadersToResult(res, cacheKeys);

  res.status(page["status-code"]);

  return renderLayout(res, {
    contentTemplate: './custom-static-page',
    store: store,
    seoTags: seoTags,
    disableAjaxNavigation: true,
  });
}

exports.customRouteHandler = function customRouteHandler(req, res, next, { config, client, renderLayout, logError, seo, getNavigationMenuArray}) {
  const url = urlLib.parse(req.url, true);
  return CustomPath.getCustomPathData(client, req.params[0])
    .then(page => {
      if(!page) {
        return next();
      }
      
      if(page.type === 'redirect') {
        if(!page["status-code"] || !page["destination-path"]) {
          logError('Defaulting the status-code to 302 with destination-path as home-page');
        }

        return res.redirect(page["status-code"] || 302, page["destination-path"] || "/");
      }

      if(page.type === 'static-page') {
        if(page.metadata.header || page.metadata.footer) {
          writeStaticPageResponse(res, page, { config, renderLayout, seo, getNavigationMenuArray });
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