const urlLib = require("url");
const {createStore} = require("redux");

const { CustomPath } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");

exports.customRouteHandler = function customRouteHandler(req, res, next, { config, client, renderLayout, logError, seo, getNavigationMenuArray}) {
  const url = urlLib.parse(req.url, true);
  return CustomPath.getCustomPathData(client, req.params[0])
    .then(page => {
      if(!page) {
        return next();
      }
      
      if(page.type === 'redirect') { 
        return res.redirect(page["status-code"], page["destination-path"]);
      }

      if(page.type === 'static-page') {
        if(page.metadata.header || page.metadata.footer) {
          const modifiedThemeAttributes = Object.assign({}, config.config["theme-attributes"], { hide_breaking_news: true });
          const updatedConfig = Object.assign({}, config.config, { "theme-attributes": modifiedThemeAttributes });
          const store = createStore((state) => state, {
            qt: {
              pageType: page.type,
              data: Object.assign({}, page.page, {navigationMenu: getNavigationMenuArray(updatedConfig.layout.menu, updatedConfig.sections)}),
              config: updatedConfig,
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
        return res.send(page.content);
      }

    })
    .catch(err => logError(e));
}