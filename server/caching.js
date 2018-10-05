exports.authorToCacheKey = function authorToCacheKey(publisherId, author) {
  return `a/${publisherId}/${author['id']}`;
}

exports.storyToCacheKey = function storyToCacheKey(publisherId, story) {
  return `s/${publisherId}/${story['id'].substr(0,8)}`;
}

exports.collectionToCacheKey = function collectionToCacheKey(publisherId, collection) {
  return `c/${publisherId}/${collection['id']}`;
}

exports.sorterToCacheKey = function sorterToCacheKey(publisherId, storyGroup, sectionId) {
  return `q/${publisherId}/${storyGroup}/${sectionId ? `section-${sectionId}` : "home"}`;
}

exports.customUrlToCacheKey = function customUrlToCacheKey(publisherId, page) {
  return `u/${publisherId}/${page['id']}`;
}
