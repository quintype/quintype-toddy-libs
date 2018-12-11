const { getWithConfig } = require("./routes");

const jsonPayLoad = {
  "bookendVersion": "v1.0",
  "shareProviders": [
    "twitter",
    "email",
    "facebook",
    "whatsapp",
    "linkedin",
    "gplus"
  ]
};  

async function handleBookend(req, res, next, {config, client}) {  
  const relatedStories = await client.getRelatedStories(req.params.storyId, req.query.section);
  console.log("related-story", relatedStories);
  const output = [].concat(
    [{
      "type": "heading",
      "text": "More to read"
    }],
    relatedStories['related-stories'].map(story => ({
      "type": "small",
      "title": `${story.headline}`,
      "image": `${config['cdn-name']}${story['hero-image-s3-key']}?w=480&auto=format&compress`,
      "url": `${config['sketches-host']}/${story.slug}`
    })),
    [{
      "type": "cta-link",
      "links": [
        {
          "text": "More stories",
          "url": `${config['sketches-host']}`
        }
      ]
    }]
    );    
    
    if(relatedStories.length > 0) {
      res.status(404);
      res.header("Cache-Control", "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=14400")
      res.header("Vary", "Accept-Encoding")
      res.json({components: output})
    } else {
      res.status(404);
      res.json({components: output})
    }
  };
  
  exports.enableVisualStories = function enableVisualStories(app, renderVisualStory, {logError}){
    getWithConfig(app, "/visual-story/:storyId/bookend.json", handleBookend, {logError})
  }