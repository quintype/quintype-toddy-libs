const request = require("request");

const renderLightPage = (req, res, result) => {
  request.get(
    `${result.currentHostUrl}/amp/story/${encodeURIComponent(req.path)}`,
    (error, response, body) => {
      if (!error) {
        res.send(body);
      }
    }
  );
};

export default renderLightPage;
