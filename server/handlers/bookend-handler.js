exports.handleBookend = function(req, res, next) {  

      return res.json(Object.assign({}, {
        "bookendVersion": "v1.0",
        "shareProviders": [
          "facebook",
          "twitter",
          "email",
          "whatsapp"
        ],
        "components": [{
          "type": "heading",
          "text": "More to read"
        }],
      }));
    };