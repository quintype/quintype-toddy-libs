const {Story} = require("../impl/api-client-impl");

exports.redirectStory = function redirectStory(req, res, next, {logError, client}) {
  return Story.getStoryBySlug(client, req.params.storySlug)
    .then(story => res.redirect(301, `/${story.slug}`))
    .catch(e => next());
}
