const urlLib = require("url");

const { CustomPath } = require("../impl/api-client-impl");

exports.handleCustomRoute = function handleCustomRoute(req, res, next, { config, client, renderLayout }) {
  const url = urlLib.parse(req.url, true);
  return CustomPath.getCustomPathData(client, req.params[0])
    .then(page => {
      if(!page || page == {}) {
        return next();
      }
      
      if(page.type === 'redirect') { 
        return res.redirect(page["status-code"], page["destination-path"]);
      }
    })
    .catch(err => console.log(err));
}