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

function getItemCacheKeys(publisherId, items, depth) {
  let storyCacheKeys = [];
  let collectionCacheKeys = [];
  items.map(item => {
    switch(item.type) {
      case "story": storyCacheKeys.push(storyToCacheKey(publisherId, item.story));
      break;
      case "collection": let collectionKeys = Collection.build(item).getCollectionCacheKeys(publisherId, depth - 1);
      storyCacheKeys.push(...collectionKeys.storyCacheKeys);
      collectionCacheKeys.push(...collectionKeys.collectionCacheKeys);
      break;
    }
  })
  return ({ storyCacheKeys, collectionCacheKeys });
}

Collection.prototype.getCollectionCacheKeys = function(publisherId, depth) {
  if (!depth) {
    return ({ storyCacheKeys: [] , collectionCacheKeys: [collectionToCacheKey(publisherId, this)] });
  }
  let { storyCacheKeys, collectionCacheKeys } = getItemCacheKeys(publisherId, this.items, depth);
  collectionCacheKeys.unshift(collectionToCacheKey(publisherId, this));
  return ({ storyCacheKeys, collectionCacheKeys });
}

Collection.prototype.cacheKeys = function(publisherId, depth) {
  const { storyCacheKeys, collectionCacheKeys } = getItemCacheKeys(publisherId, this.items, depth + 1);
  return [collectionToCacheKey(publisherId, this)].concat([...collectionCacheKeys, ...storyCacheKeys.slice(0, 200 - collectionCacheKeys.length)]);
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
