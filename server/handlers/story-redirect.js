const {Story} = require("../impl/api-client-impl");
const {addCacheHeadersToResult, defaultCacheHeaders} = require("./cdn-caching");
const {storyToCacheKey} = require("../caching");

function addCacheHeaders(res, config, story) {
  const cacheKeys = storyToCacheKey(config["publisher-id"], story);
  return cacheKeys ? addCacheHeadersToResult(res, [cacheKeys]) : defaultCacheHeaders(res);
}


exports.redirectStory = function redirectStory(req, res, next, {logError, config, client}) {
  return Story.getStoryBySlug(client, req.params.storySlug)
    .then(story => {
      if(story) {
        addCacheHeaders(res, config, story);
        return res.redirect(301, `/${story.slug}`)
      } else {
        return next();
      }
    })
    .catch(e => next());
}
