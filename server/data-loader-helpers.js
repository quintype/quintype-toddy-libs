// istanbul ignore file

const {Story, Collection} = require('./api-client');
const templateOptions = require('./template-options');

exports.catalogDataLoader = function catalogDataLoader(client, config) {
  return Story.getStories(client)
    .then(stories => {
      return {
        stories: stories.map(story => story.asJson()),
        cacheKeys: [`static`],
        templateOptions
      }
    });
}

exports.homeCollectionOrStories = function homeCollectionOrStories(client) {
  return Collection.getCollectionBySlug(client, "home", { 'item-type': 'collection'}, {depth: 1})
    .then(collection => {
      if(collection)
        return collection;
      else
        return Story.getStories(client).then(stories => Collection.build({
          slug: 'home',
          name: "Home",
          template: "default",
          items: [{
            type: 'collection',
            name: "Home",
            template: "default",
            items: stories.map(story => ({type: 'story', story: story.asJson()}))
          }]
        }))
    })
}
