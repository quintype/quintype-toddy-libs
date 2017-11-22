import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import { createBrowserHistory } from 'history'

import { IsomorphicComponent } from '../isomorphic/component'
import { BreakingNews } from '../components/breaking-news'
import { NAVIGATE_TO_PAGE, CLIENT_SIDE_RENDERED, PAGE_LOADING, PAGE_FINISHED_LOADING } from '../store/actions';

export const history = createBrowserHistory();

export function getRouteData(path, opts) {
  opts = opts || {};
  return superagent.get('/route-data.json', Object.assign({path: path}, opts));
}

export function navigateToPage(dispatch, path, doNotPushPath) {
  dispatch({
    type: PAGE_LOADING,
    isAppLoading: true
  })
  getRouteData(path)
    .then((response) => dispatch({
      type: NAVIGATE_TO_PAGE,
      page: response.body,
      currentPath: path
    })).then(() => {
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

export let app = {navigateToPage, maybeNavigateTo, maybeSetUrl};

export function renderComponent(clazz, container, store, props) {
  return ReactDOM.render(
    React.createElement(Provider, {store: store},
      React.createElement(clazz, props || {})),
    document.getElementById(container),
  () => store.dispatch({type: CLIENT_SIDE_RENDERED}));
}

export function renderIsomorphicComponent(container, store, pickComponent, props) {
  return renderComponent(IsomorphicComponent, container, store, Object.assign({pickComponent}, props));
}

export function renderBreakingNews(container, store, view, props) {
  return renderComponent(BreakingNews, container, store, Object.assign({view}, props));
}
