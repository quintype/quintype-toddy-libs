const urlLib = require("url");
const {createStore} = require("redux");

const { CustomPath } = require("../impl/api-client-impl");

exports.customRouteHandler = function customRouteHandler(req, res, next, { config, client, renderLayout, logError, seo}) {
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
              data: page,
              config: updatedConfig,
              currentPath: `${url.pathname}${url.search || ""}`,
              disableIsomorphicComponent: true
            }
          });

          const seoInstance = (typeof seo == 'function') ? seo(config) : seo;
          const seoTags = seoInstance && seoInstance.getMetaTags(config, page.type, {}, {url});
          
          const cacheKey = "static";
          res.setHeader('Cache-Control', "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=14400");
          res.setHeader('Vary', "Accept-Encoding");
          // Cloudflare Headers
          res.setHeader('Cache-Tag', cacheKey);
          // Fastly Header
          res.setHeader('Surrogate-Control', "public,max-age=240,stale-while-revalidate=300,stale-if-error=14400");
          res.setHeader('Surrogate-Key', cacheKey);

          res.status(page["status-code"]);

          return renderLayout(res, {
            contentTemplate: './custom-static-page',
            store: store,
            seoTags: seoTags
          });
        }
        return res.send(page.content);
      }

    })
    .catch(err => logError(e));
}