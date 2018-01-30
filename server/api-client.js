const { Client, Story, Author, Member, Collection } = require("quintype-backend");
const config = require("./publisher-config");

const defaultClient = new Client(config.sketches_host);
const cachedSecondaryClients = {};

const {getClientImpl} = require("./impl/api-client-impl");

function getClient(hostname) {
  return getClientImpl(config, cachedSecondaryClients, hostname) || defaultClient;
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
           .concat(this.items
                       .filter(item => item["type"] == "story")
                       .map(item => storyToCacheKey(publisherId, item.story)));
};

Story.prototype.cacheKeys = function(publisherId) {
  return [storyToCacheKey(publisherId, this)]
    .concat((this.authors || []).map(author => authorToCacheKey(publisherId, author)));
}
