import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import get from 'lodash/get';
import { createBrowserHistory } from 'history'

import { BreakingNews } from '@quintype/components';
import { NAVIGATE_TO_PAGE, CLIENT_SIDE_RENDERED, PAGE_LOADING, PAGE_FINISHED_LOADING } from '@quintype/components';
import { createQtStore } from '../store/create-store';
import { IsomorphicComponent } from '../isomorphic/component'
import { startAnalytics, registerPageView, registerStoryShare, setMemberId } from './analytics';
import { registerServiceWorker, setupServiceWorkerUpdates, checkForServiceWorkerUpdates } from './impl/load-service-worker';
import { makePickComponentSync } from '../isomorphic/make-pick-component-sync';
import { initializeFCM } from './fcm';

require("../assetify/client")();

export const history = createBrowserHistory();

// App gets two more functions: updateServiceWorker and getAppVersion later
export const app = {navigateToPage, maybeNavigateTo, maybeSetUrl, registerPageView, registerStoryShare, setMemberId};

function getRouteData(path, {location = global.location, existingFetch}) {
  const url = new URL(path, location.origin);
  return (existingFetch || fetch(`/route-data.json?path=${encodeURIComponent(url.pathname)}${url.search ? `&${  url.search.slice(1)}` : ""}`, {credentials: 'same-origin'}))
    .then(response => {
      if(response.status == 404) {
        // There is a chance this might abort
        maybeBypassServiceWorker();
      }

      return response.json();
    }).then(maybeRedirect);

  function maybeRedirect(page) {
    // This next line aborts the entire load
    if(page.httpStatusCode == 301 && page.data && page.data.location) {
      location.assign(page.data.location);
      return null;
    }

    return page;
  }

  function maybeBypassServiceWorker(e) {
    if(global.qtLoadedFromShell || `${location.pathname}${location.search}${location.hash}` != `${path}#bypass-sw`) {
      location.href = `${path}#bypass-sw`;
      location.reload();
    }
  }
}

let pickComponentWrapper = null;

export function navigateToPage(dispatch, path, doNotPushPath) {
  if(global.disableAjaxNavigation) {
    global.location = path;
  }

  dispatch({type: PAGE_LOADING});
  getRouteData(path, {})
    .then(page => {
      if (!page) {
        console && console.log("Recieved a null page. Expecting the browser to redirect.")
        return;
      }

      checkForServiceWorkerUpdates(app, page);

      if(page.disableIsomorphicComponent) {
        global.location = path;
        return;
      }

      Promise.resolve(pickComponentWrapper && pickComponentWrapper.preloadComponent(page.pageType))
        .then(() => {
          dispatch({
            type: NAVIGATE_TO_PAGE,
            page,
            currentPath: path
          });

          if(!doNotPushPath) {
            history.push(path);
            registerPageView(page, path);
          }
        });
      return page;
    });
}

export function maybeNavigateTo(path, store) {
  if(store.getState().qt.currentPath != path)
    navigateToPage(store.dispatch, path, true);
}

export function maybeSetUrl(path, title) {
  if(global.location.pathname == path)
    return;
  global.history.pushState && global.history.pushState(null, title, path);
  global.document.title = title;
}

export function renderComponent(clazz, container, store, props = {}, callback) {
  const component = React.createElement(Provider, {store},
                      React.createElement(clazz, props || {}));

  if(props.hydrate) {
    return ReactDOM.hydrate(component, document.getElementById(container), callback);
  }
  return ReactDOM.render(component, document.getElementById(container), callback);

}

export function renderIsomorphicComponent(container, store, pickComponent, props) {
  if(!store.getState().qt.disableIsomorphicComponent) {
    pickComponentWrapper = makePickComponentSync(pickComponent);
    return pickComponentWrapper.preloadComponent(store.getState().qt.pageType)
      .then(() => renderComponent(IsomorphicComponent, container, store, Object.assign({pickComponent: pickComponentWrapper}, props), () => store.dispatch({type: CLIENT_SIDE_RENDERED})))
  }
  console && console.log("IsomorphicComponent is disabled");

}

export function renderBreakingNews(container, store, view, props) {
  return renderComponent(BreakingNews, container, store, Object.assign({view}, props));
}

function getJsonContent(id) {
  const element = global.document.getElementById(id);
  if(element)
    return JSON.parse(element.textContent);
}

const performance = window.performance || {mark: () => {}, measure: () => {}}
function runWithTiming(name, f) {
  performance.mark(`${name}Start`)
  f();
  performance.mark(`${name}Finish`)
  performance.measure(`${name}Time`, `${name}Start`, `${name}Finish`);
}

export function startApp(renderApplication, reducers, opts) {
  app.getAppVersion = () => opts.appVersion || 1;
  global.app = app;
  const {location} = global;
  const path = `${location.pathname}${location.search || ""}`;
  const staticData = global.staticPageStoreContent || getJsonContent('static-page');
  const dataPromise = staticData
    ? Promise.resolve(staticData.qt)
    : getRouteData(path, {existingFetch: global.initialFetch})

  const serviceWorkerPromise = registerServiceWorker(opts);

  startAnalytics();

  const store = createQtStore(reducers, (staticData && staticData.qt) || global.initialPage || getJsonContent('initial-page') || {}, {});

  if(opts.preRenderApplication) {
    runWithTiming("qt_preRender", () => opts.preRenderApplication(store))
  }

  return dataPromise.then(page => doStartApp(page));

  function doStartApp(page){
    if(!page) {
      console && console.log("Recieved a null page. Expecting the browser to redirect.")
      return;
    }

    store.dispatch({ type: NAVIGATE_TO_PAGE, page, currentPath: path });
    if( opts.enableFCM ) {
      const mssgSenderId = get(page, ["config", "fcmMessageSenderId"], null);
      initializeFCM(mssgSenderId);
    }
    setupServiceWorkerUpdates(serviceWorkerPromise, app, store, page)

    runWithTiming('qt_render', () => renderApplication(store))

    history.listen(change => app.maybeNavigateTo(`${change.pathname}${change.search || ""}`, store));

    registerPageView(store.getState().qt);

    if(page.title) {
      global.document.title = get(page, ['data', 'story', 'seo', 'meta-title'], page.title);
    }
    return store;
  };
}
