import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import urlLib from 'url';

import { createBrowserHistory } from 'history'

import { createQtStore } from '../store/create-store';
import { IsomorphicComponent } from '../isomorphic/component'
import { BreakingNews } from '@quintype/components';
import { NAVIGATE_TO_PAGE, CLIENT_SIDE_RENDERED, PAGE_LOADING, PAGE_FINISHED_LOADING } from '@quintype/components/store/actions';

export const history = createBrowserHistory();

export function getRouteData(path, opts) {
  const url = urlLib.parse(path, true)
  return superagent.get('/route-data.json', Object.assign({path: url.pathname}, url.query));
}

export function navigateToPage(dispatch, path, doNotPushPath) {
  if(global.disableAjaxNavigation) {
    global.location = path;
  }

  dispatch({type: PAGE_LOADING});
  getRouteData(path)
    .then(response => response.body)
    .then(page => {
      if(page.disableIsomorphicComponent) {
        global.location = path;
      } else {
        dispatch({
          type: NAVIGATE_TO_PAGE,
          page: page,
          currentPath: path
        });
      }
      return page;
    }).then(({title}) => {
      if(title)
        global.document.title = title;

      if(!doNotPushPath)
        history.push(path)
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

function getAssetCdn() {
  const script = global.document.getElementById("app-js");
  if(script && script.src)
    return urlLib.parse(script.src).host;
}

export const app = {navigateToPage, maybeNavigateTo, maybeSetUrl, assetCdn: `//${getAssetCdn() || "fea.assettype.com"}`};

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
  global.Promise = global.Promise || require("bluebird");
  global.superagent = require('superagent-promise')(require('superagent'), Promise);
  global.app = app;

  if(opts.enableServiceWorker && global.navigator.serviceWorker) {
    global.navigator.serviceWorker.register("/service-worker.js");
  }

  const location = global.location;
  return getRouteData(`${location.pathname}${location.search || ""}`, {config: true})
    .then((result) => {
      const store = createQtStore(reducers, result.body);

      renderApplication(store);
      history.listen(change => app.maybeNavigateTo(`${change.pathname}${change.search || ""}`, store));

      return store;
    });
}
