exports.authorToCacheKey = function authorToCacheKey(publisherId, author) {
  return `a/${publisherId}/${author['id'].substr(0,8)}`;
}

exports.storyToCacheKey = function storyToCacheKey(publisherId, story) {
  return `s/${publisherId}/${story['id'].substr(0,8)}`;
}

exports.collectionToCacheKey = function collectionToCacheKey(publisherId, collection) {
  return `s/${publisherId}/${collection['id']}`;
}

exports.sorterToCacheKey = function sorterToCacheKey(publisherId, storyGroup, sectionId) {
  return `c/${publisherId}/${storyGroup}/${sectionId ? `section-${sectionId}` : "home"}`
}
