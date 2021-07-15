/**
 * How Quintype handles caching
 * - Whenever a collection/story/author is created or updated, the platform does cache/purging through CDN.
 * - When a collection/story/author is created, the request body tag gets affected, then the frontend gets updated with the latest data with the help of cache-keys.
 *
 * How cache keys are created
 * - Cache keys are generated in `quintype-node-framework` (server/caching.js). We have explained how cache keys are generated for each page type
 *
 * This namespace implements various caching utilities. However, using these functions is deprecated in favor
 * of using {@link module:api-client api-client} and *cacheKeys*.
 *
 * ```javascript
 * import * from "@quintype/framework/server/caching";
 * ```
 *
 * @category Server
 * @module caching
 * @deprecated Please use {@link module:api-client api-client}
 */

/**
 * Get the cache key for an author
 * @param {number} publisherId Publisher Id
 * @param {Object} author The Author
 * @returns {string} The cache key
 */
exports.authorToCacheKey = function authorToCacheKey(publisherId, author) {
  return `a/${publisherId}/${author.id}`;
};

/**
 * Get the cache key for a story
 * @param {number} publisherId Publisher Id
 * @param {Object} story The Story
 * @returns {string} The cache key
 */
exports.storyToCacheKey = function storyToCacheKey(publisherId, story) {
  return `s/${publisherId}/${story.id.substr(0, 8)}`;
};

/**
 * Get the cache key for a collection
 * @param {number} publisherId Publisher Id
 * @param {Object} collection The Collection. Note, this is not recursive
 * @returns {string} The cache key
 */
exports.collectionToCacheKey = function collectionToCacheKey(publisherId, collection) {
  return `c/${publisherId}/${collection.id}`;
};

exports.sorterToCacheKey = function sorterToCacheKey(publisherId, storyGroup, sectionId) {
  return `q/${publisherId}/${storyGroup}/${sectionId ? `section-${sectionId}` : "home"}`;
};

/**
 * Get the cache key for a customUrl
 * @param {number} publisherId Publisher Id
 * @param {Object} page The Custom URL
 * @returns {string} The cache key
 */
exports.customUrlToCacheKey = function customUrlToCacheKey(publisherId, page) {
  return `u/${publisherId}/${page.id}`;
};

/**
 * Note: We form the cache keys for nested collection by going from the top-level depth to the initial depth of the collections. The values that we get for all the collections/stories on the respective pages are then comma-separated and passed to the Cache-Tag header.
 */
