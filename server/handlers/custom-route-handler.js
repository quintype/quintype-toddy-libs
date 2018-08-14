const urlLib = require("url");
const {createStore} = require("redux");

const { Static } = require("../api-client");

exports.handleCustomRoute = function handleCustomRoute(req, res, next, { config, client, renderLayout }) {
  const url = urlLib.parse(req.url, true);

  Static.getStaticData(client, req.params[0])
    .then(response => {
      if(!response || !response.page || response.page["status-code"] == 404) {
        next();
      }
      if(response.page.type === 'redirect') { 
        return res.redirect(301, response.page["destination-path"]);
      }
    })
}