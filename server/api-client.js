const { Client, Story, Author, Member, Collection } = require("quintype-backend");
const config = require("./publisher-config");

const defaultClient = new Client(config.sketches_host);
const cachedSecondaryClients = {};

function getClient(hostname) {
  return cachedSecondaryClients[hostname] || createTemporaryClient(hostname) || defaultClient;
}

function createTemporaryClient(hostname) {
  const matchedString = (config.host_to_automatic_api_host || []).some(str => hostname.includes(str) && str);
  if(matchedString)
    return new Client(`https://${hostname.replace(matchedString, "")}`, true);
}

function initializeAllClients() {
  const promises = [defaultClient.getConfig()];
  Object.entries(config.host_to_api_host || []).forEach(([host, apiHost]) => {
    const client = new Client(apiHost);
    cachedSecondaryClients[host] = client;
    promises.push(client.getConfig());
  });
  return Promise.all(promises);
}

module.exports = {
  Story: Story,
  Author: Author,
  Collection: Collection,
  Member: Member,

  client: defaultClient,
  getClient: getClient,
  initializeAllClients: initializeAllClients
};

// Patching functions for caching related. Ideally should happen elsewhere
const _ = require("lodash");
const { storyToCacheKey, collectionToCacheKey, authorToCacheKey } = require("./caching");

Collection.prototype.cacheKeys = function(publisherId) {
  return [collectionToCacheKey(publisherId, this)]
    .concat(this.items.map(item => {
      if(item["type"] == "collection")
        return collectionToCacheKey(publisherId, item.collection)
      else if(item["type"] == "story")
        return storyToCacheKey(publisherId, item.story)
    }));
};

Story.prototype.cacheKeys = function(publisherId) {
  return [storyToCacheKey(publisherId, this)]
    .concat((this.authors || []).map(author => authorToCacheKey(publisherId, author)));
}
