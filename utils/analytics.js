function trackStoryElementAction(data, action){
  const { story, card, element } = data;
  qlitics('track', 'story-element-action', {
    'story-content-id': story['story-content-id'],
    'story-version-id': story['story-version-id'],
    'card-content-id': card['content-id'],
    'card-version-id': card['content-version-id'],
    'story-element-id': element.id,
    'story-element-type': element.type,
    'story-element-action': action
  });
}

function trackStoryElementView(data){
  const { story, card, element } = data;
  qlitics('track', 'story-element-view', {
    'story-content-id': story['story-content-id'],
    'story-version-id': story['story-version-id'],
    'card-content-id': card['content-id'],
    'card-version-id': card['content-version-id'],
    'story-element-id': element.id,
    'story-element-type': element.type
  });
}

module.exports = {
  trackStoryElementAction : trackStoryElementAction,
  trackStoryElementView: trackStoryElementView
};
