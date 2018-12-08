const request = require("request");

const jsonPayLoad = {
    "bookendVersion": "v1.0",
    "shareProviders": [
      "twitter",
      "email",
      "facebook",
      "whatsapp"
    ]
  };

const FIELDS = "id,headline,slug,hero-image-s3-key";


exports.handleBookend = function(req, res, next, {config}) {  
      return request(`${config['sketches-host']}/api/v1/stories/${req.query.id}/related-stories?fields=${FIELDS}&section-id=${req.query.section}`, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          const parsedBody = JSON.parse(body);
          const componentsArray = parsedBody['related-stories'].reduce((acc, story) => {
            acc.push({
              "type": "small",
              "title": `${story.headline}`,
              "image": `${config['cdn-name']}${ story['hero-image-s3-key']}?w=480&auto=format&compress`,
              "url": `${config['sketches-host']}/${story.slug}`
            })
            return acc;
          }, []);
          componentsArray.unshift({
            "type": "heading",
            "text": "More to read"
          })
          componentsArray.push({
            "type": "cta-link",
            "links": [
              {
                "text": "More stories",
                "url": `${config['sketches-host']}`
              }
            ]
          });
          jsonPayLoad.components = componentsArray;
          res.json(jsonPayLoad);
        } else {
          res.status(response.statusCode).json(jsonPayLoad);
        }
      });
};


