// istanbul ignore file

const {Story} = require('./api-client');
const templateOptions = require('./template-options');

exports.catalogDataLoader = function(client, config) {
  return Story.getStories(client)
    .then(stories => {
      return {
        stories: stories.map(story => story.asJson()),
        cacheKeys: [`static`],
        templateOptions
      }
    });
}
