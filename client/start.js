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
import { registerServiceWorker, setupServiceWorkerUpdates, checkForServiceWorkerUpdates } from './load-service-worker';

export const history = createBrowserHistory();

// App gets two more functions: updateServiceWorker and getAppVersion later
export const app = {navigateToPage, maybeNavigateTo, maybeSetUrl, registerPageView};

export function getRouteData(path, opts) {
  const url = urlLib.parse(path, true)
  return superagent.get('/route-data.json', Object.assign({path: url.pathname}, url.query))
    .then(response => {
      const page = response.body || {};
      return response;
    });
}

export function navigateToPage(dispatch, path, doNotPushPath) {
  if(global.disableAjaxNavigation) {
    global.location = path;
  }

  dispatch({type: PAGE_LOADING});
  getRouteData(path)
    .then(response => {
      const page = response.body;

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

export function renderComponent(clazz, container, store, props) {
  return ReactDOM.render(
    React.createElement(Provider, {store: store},
      React.createElement(clazz, props || {})),
    document.getElementById(container),
  () => store.dispatch({type: CLIENT_SIDE_RENDERED}));
}

export function renderIsomorphicComponent(container, store, pickComponent, props) {
  if(!store.getState().qt.disableIsomorphicComponent) {
    return renderComponent(IsomorphicComponent, container, store, Object.assign({pickComponent}, props));
  } else {
    console && console.log("IsomorphicComponent is disabled");
  }
}

export function renderBreakingNews(container, store, view, props) {
  return renderComponent(BreakingNews, container, store, Object.assign({view}, props));
}

export function startApp(renderApplication, reducers, opts) {
  app.getAppVersion = () => opts.appVersion || 1;
  global.Promise = global.Promise || require("bluebird");
  global.superagent = require('superagent-promise')(require('superagent'), Promise);
  global.app = app;

  startAnalytics();

  const serviceWorkerPromise = registerServiceWorker(opts);

  if(global.staticPageStoreContent)
    return Promise.resolve(doStartApp(global.staticPageStoreContent["qt"]))

  const location = global.location;

  return getRouteData(`${location.pathname}${location.search || ""}`, {config: true})
    .then(response => doStartApp(response.body));


  function doStartApp(page){
    const store = createQtStore(reducers, page);

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
