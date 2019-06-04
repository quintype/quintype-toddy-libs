import get from 'lodash/get'
import { runWhenIdle } from "./run-when-idle";

// istanbul ignore next
export function startAnalytics() {
  global.qlitics=global.qlitics||function(){(qlitics.q=qlitics.q||[]).push(arguments);};
  global.qlitics('init');

  runWhenIdle(function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '/qlitics.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  });
}

function pageTypeToQliticsPageType(pageType) {
  switch(pageType) {
    case 'story-page': return 'story';
    case 'home-page': return 'home';
    case 'section-page': return 'section';
    case 'tag-page': return 'topic';
    default: return pageType;
  }
}

export function registerStoryView(storyContentId) {
  global.qlitics('track', 'story-view', {
    'story-content-id': storyContentId,
  });
}

export function registerPageView(page, newPath) {
  global.qlitics('track', 'page-view', {"page-type": pageTypeToQliticsPageType(page.pageType)})
  if(page.pageType == 'story-page') {
    registerStoryView(get(page.data, ["story", "id"]));
  }

  if(newPath && global.ga && !global.qtNoAutomaticGATracking) {
    global.ga(function(tracker) {
      tracker = tracker || global.ga.getByName("gtm1");
      if(!tracker)
        return;
      tracker.set('page', newPath);
      tracker.send('pageview');
    })
  }
}

export function setMemberId(memberId) {
  global.qlitics('set', 'member-id', memberId);
}

export function registerStoryShare(storyContentId, socialMediaType, storyUrl) {
  global.qlitics('track', 'story-share', {
    'story-content-id': storyContentId,
    'social-media-type': socialMediaType,
    'url': storyUrl,
  });
}
