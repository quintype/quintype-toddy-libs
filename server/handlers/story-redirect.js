const { Story } = require("../impl/api-client-impl");
const { addCacheHeadersToResult } = require("./cdn-caching");
const { storyToCacheKey } = require("../caching");

exports.redirectStory = function redirectStory(
  req,
  res,
  next,
  { logError, config, client, cdnProvider = null }
) {
  return Story.getStoryBySlug(client, req.params.storySlug)
    .then((story) => {
      if (story) {
        addCacheHeadersToResult({
          res: res, cacheKeys: [
            storyToCacheKey(config["publisher-id"], story),
          ], cdnProvider: cdnProvider, config: config
        });
        return res.redirect(301, `/${story.slug}`);
      } else {
        return next();
      }
    })
    .catch((e) => next());
};
