const { Client, Story, Author, Member, Collection } = require("quintype-backend");
const { storyToCacheKey, collectionToCacheKey, authorToCacheKey, sorterToCacheKey } = require("../caching");
const _ = require("lodash");

function getClientImpl(config, cachedSecondaryClients, hostname) {
  return cachedSecondaryClients[hostname] || createTemporaryClient(config, hostname);
}

function createTemporaryClient(config, hostname) {
  const matchedString = (config.host_to_automatic_api_host || []).find(str => hostname.includes(str));
  if(matchedString)
    return new Client(`https://${hostname.replace(matchedString, "")}`, true);
}

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

Story.sorterToCacheKey = sorterToCacheKey;

module.exports = {getClientImpl, Client, Story, Author, Member, Collection};
