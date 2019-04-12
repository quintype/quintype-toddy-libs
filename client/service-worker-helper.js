// istanbul ignore file: Needs to be run as a service worker

import {matchBestRoute} from '../isomorphic/match-best-route';

const workboxVersion = '2.1.1';

function qDebug() {
  if(process.env.NODE_ENV !== 'production') {
    console.debug.apply(console, arguments);
  }
}

export function initializeQServiceWorker(self, params) {
  importScripts(`https://unpkg.com/workbox-sw@${workboxVersion}/build/importScripts/workbox-sw.${process.env.NODE_ENV == 'production' ? 'prod' : 'dev'}.v${workboxVersion}.js`);

  const routeMatcher = function({event, url}) {
    if(event.request.mode !== 'navigate') {
      return false;
    }

    // Can this somehow be changed to using a combination of qtLoadedFromShell and some other stuff?
    // Other random libraries may change this fragment
    if(url.searchParams.has("bypass-sw") || url.hash == '#bypass-sw') {
      qDebug(`Bypassing the shell due to bypass-sw being present`);
      return false;
    }

    if(matchBestRoute(url.pathname, params.routes)) {
      qDebug(`Rendering the shell for navigation to ${url.pathname}`);
      return true;
    } 
      qDebug(`Not rendering the shell for navigation to ${url.pathname}`);
      return false;
    
  };
  const shellHandler = ({event}) => caches.match('/shell.html').then((r) => r || fetch(event.request));

  const workbox = new WorkboxSW({clientsClaim: true, skipWaiting: true});
  workbox.precache(params.assets);
  workbox.router.registerRoute(routeMatcher, shellHandler);
  return workbox;
};
