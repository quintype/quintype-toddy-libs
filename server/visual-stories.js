const { getWithConfig } = require("./routes");
const {Story} = require("./impl/api-client-impl");
const {addCacheHeadersToResult} = require("./handlers/cdn-caching");
const {storyToCacheKey} = require("./caching");

async function handleBookend(req, res, next, {config, client}) {
  const relatedStoriesResponse = await client.getRelatedStories(req.params.storyId, req.query.section);
  const relatedStories = relatedStoriesResponse["related-stories"];

  const jsonPayLoad = {
    "bookendVersion": "v1.0",
    "shareProviders": [
      "twitter",
      "email",
      "facebook",
      "whatsapp",
      "linkedin",
      "gplus"
    ],
    components: [].concat(
      [{
        "type": "heading",
        "text": "More to read"
      }],
      relatedStories.map(story => ({
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
      )
    };

    if(relatedStories.length > 0) {
      res.header("Cache-Control", "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=14400")
      res.header("Vary", "Accept-Encoding")
      res.json(jsonPayLoad);
    } else {
      res.status(404);
      res.json({error: {message: "Not Found"}});
    }
  };

  async function handleVisualStory(req, res, next, {config, client, renderVisualStory}) {
    const story = await Story.getStoryBySlug(client, req.params.storySlug);

    if(story == null || story['story-template'] !== 'visual-story') {
      res.status(404);
      res.end();
    } else {
      addCacheHeadersToResult(res, [storyToCacheKey(config["publisher-id"], story)]);
      await renderVisualStory(res, story, {config, client});
    }
  }

  exports.enableVisualStories = function enableVisualStories(app, renderVisualStory, {logError}){
    getWithConfig(app, "/ampstories/:storyId/bookend.json", handleBookend, {logError});
    getWithConfig(app, "/ampstories/*/:storySlug", handleVisualStory, {logError, renderVisualStory});
  }