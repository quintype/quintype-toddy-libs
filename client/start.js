import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import urlLib from 'url';
import { createBrowserHistory } from 'history'

require("../assetify/client")();

import { createQtStore } from '../store/create-store';
import { IsomorphicComponent } from '../isomorphic/component'
import { BreakingNews } from '@quintype/components';
import { NAVIGATE_TO_PAGE, CLIENT_SIDE_RENDERED, PAGE_LOADING, PAGE_FINISHED_LOADING } from '@quintype/components/store/actions';
import { startAnalytics, registerPageView } from './analytics'
import { registerServiceWorker, setupServiceWorkerUpdates, checkForServiceWorkerUpdates } from './impl/load-service-worker';

export const history = createBrowserHistory();

// App gets two more functions: updateServiceWorker and getAppVersion later
export const app = {navigateToPage, maybeNavigateTo, maybeSetUrl, registerPageView};

export function getRouteData(path, {location = global.location, existingFetch}) {
  const url = urlLib.parse(path)
  return (existingFetch || fetch(`/route-data.json?path=${encodeURIComponent(url.pathname)}${url.query ? "&" + url.query : ""}`, {credentials: 'same-origin'}))
    .then(response => response.json())
    .then(page => {
      // This next line aborts the entire load
      if(page.httpStatusCode == 301 && page.data && page.data.location)
        location.href = page.data.location;

      return page;
    });
}

export function navigateToPage(dispatch, path, doNotPushPath) {
  if(global.disableAjaxNavigation) {
    global.location = path;
  }

  dispatch({type: PAGE_LOADING});
  getRouteData(path, {})
    .then(page => {
      checkForServiceWorkerUpdates(app, page);

      if(page.disableIsomorphicComponent) {
        global.location = path;
        return;
      }

      dispatch({
        type: NAVIGATE_TO_PAGE,
        page: page,
        currentPath: path
      });

      if(!doNotPushPath) {
        history.push(path);
        registerPageView(page, path);
      }

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

export function renderComponent(clazz, container, store, props, callback) {
  return ReactDOM.render(
    React.createElement(Provider, {store: store},
      React.createElement(clazz, props || {})),
    document.getElementById(container),
    callback);
}

export function renderIsomorphicComponent(container, store, pickComponent, props) {
  if(!store.getState().qt.disableIsomorphicComponent) {
    return renderComponent(IsomorphicComponent, container, store, Object.assign({pickComponent}, props), () => store.dispatch({type: CLIENT_SIDE_RENDERED}));
  } else {
    console && console.log("IsomorphicComponent is disabled");
  }
}

export function renderBreakingNews(container, store, view, props) {
  return renderComponent(BreakingNews, container, store, Object.assign({view}, props));
}

function getJsonContent(id) {
  const element = global.document.getElementById(id);
  if(element)
    return JSON.parse(element.textContent);
}

export function startApp(renderApplication, reducers, opts) {
  app.getAppVersion = () => opts.appVersion || 1;
  global.app = app;

  const location = global.location;
  const path = `${location.pathname}${location.search || ""}`;
  const staticData = global.staticPageStoreContent || getJsonContent('static-page');
  const dataPromise = staticData
    ? Promise.resolve(staticData["qt"])
    : getRouteData(path, {existingFetch: global.initialFetch})

  const serviceWorkerPromise = registerServiceWorker(opts);

  startAnalytics();

  const store = createQtStore(reducers, global.initialPage || getJsonContent('initial-page') || {}, {});

  opts.preRenderApplication && opts.preRenderApplication(store);

  return dataPromise.then(page => doStartApp(page));


  function doStartApp(page){
    store.dispatch({ type: NAVIGATE_TO_PAGE, page: page, currentPath: path });

    setupServiceWorkerUpdates(serviceWorkerPromise, app, store, page)

    renderApplication(store);
    history.listen(change => app.maybeNavigateTo(`${change.pathname}${change.search || ""}`, store));

    registerPageView(store.getState().qt);

    if(page.title) {
      global.document.title = page.title;
    }

    return store;
  };
}
