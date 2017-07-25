import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import { IsomorphicComponent } from '../isomorphic/component'
import { BreakingNews } from '../components/breaking-news'

export function renderComponent(clazz, container, store, props) {
  return ReactDOM.render(
    React.createElement(Provider, {store: store},
      React.createElement(clazz, props || {})),
    document.getElementById(container));
}

export function renderIsomorphicComponent(container, store, pickComponent, props) {
  return renderComponent(IsomorphicComponent, container, store, Object.assign({pickComponent}, props));
}

export function renderBreakingNews(container, store, view, props) {
  return renderComponent(BreakingNews, container, store, Object.assign({view}, props));
}
