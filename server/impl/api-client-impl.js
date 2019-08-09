const { Client, Story, Author, CustomPath, Member, Collection, Entity, MenuGroups, Config } = require("@quintype/backend");
const { storyToCacheKey, collectionToCacheKey, authorToCacheKey, sorterToCacheKey, customUrlToCacheKey } = require("../caching");
const _ = require("lodash");

function getClientImpl(config, cachedSecondaryClients, hostname) {
  return cachedSecondaryClients[hostname] || createTemporaryClient(config, hostname);
}

function createTemporaryClient(config, hostname) {
  const configuredHosts = config.host_to_api_host || {};
  if(configuredHosts[hostname]) {
    return new Client(configuredHosts[hostname], true);
  }

  const matchedString = (config.host_to_automatic_api_host || []).find(str => hostname.includes(str));
  if(matchedString)
    return new Client(`https://${hostname.replace(matchedString, "")}`, true);
}

function itemToCacheKey(publisherId, item) {
  switch(item.type) {
    case "story": return [storyToCacheKey(publisherId, item.story)];
    case "collection": return Collection.build(item).cacheKeys(publisherId).slice(0, 5);
    default: return [];
  }
}

Collection.prototype.cacheKeys = function(publisherId) {
  return [collectionToCacheKey(publisherId, this)]
           .concat(_.flatMap(this.items, item => itemToCacheKey(publisherId, item)));
};

Story.prototype.cacheKeys = function(publisherId) {
  return [storyToCacheKey(publisherId, this)]
    .concat((this.authors || []).map(author => authorToCacheKey(publisherId, author)));
}

Story.sorterToCacheKey = sorterToCacheKey;

Author.prototype.cacheKeys = function(publisherId) {
  const author = this.author;
  return author && author.id ? [authorToCacheKey(publisherId, author)] : null;
}

CustomPath.prototype.cacheKeys = function(publisherId) {
  const page = this.page;
  return page && page.id ? [customUrlToCacheKey(publisherId, page)] : null;
}

module.exports = {getClientImpl, Client, Story, Author, CustomPath, Member, Collection, Entity, MenuGroups, Config};
