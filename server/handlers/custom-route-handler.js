const urlLib = require("url");
const {createStore} = require("redux");

const { Static } = require("../api-client");

exports.handleCustomRoute = function handleCustomRoute(req, res, next, { config, client, renderLayout }) {
    const url = urlLib.parse(req.url, true);

    Static.getStaticData(client, req.params[0])
    .then(response => {
        if(response.page.type === 'redirect') { 
          res.redirect(301, response.page["destination-path"]);
        }
        if(response.page.type === 'static-page') {
          if(response.page.metadata.header && response.page.metadata.footer) {
            const store = createStore((state) => state, {
              qt: {
                pageType: response.page.type,
                data: response.page,
                config: config,
                currentPath: `${url.pathname}${url.search || ""}`
              }
            });

            return renderLayout(res, {
                contentTemplate: './custom-static-page',
                store: store
            })    
          }
          res.send(response.page);
        }
    })
    .catch(err => next())
}