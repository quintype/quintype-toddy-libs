import {get} from 'lodash'

// istanbul ignore next
export function startAnalytics() {
  global.qlitics=global.qlitics||function(){(qlitics.q=qlitics.q||[]).push(arguments);};
  global.qlitics('init');

  (function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '/qlitics.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
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

export function registerPageView(page, newPath) {
  global.qlitics('track', 'page-view', {"page-type": pageTypeToQliticsPageType(page.pageType)})
  if(page.pageType == 'story-page') {
    global.qlitics('track', 'story-view', {
      'story-content-id': get(page.data, ["story", "id"])
    });
  }

  if(newPath && global.ga) {
    global.ga('set', 'page', newPath);
    global.ga('send', 'pageview');
  }
}
