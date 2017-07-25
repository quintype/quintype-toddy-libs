import { createStore } from 'redux';
import { NAVIGATE_TO_PAGE, BREAKING_NEWS_UPDATED } from './actions';

function internalReducers(state, action) {
  switch (action.type) {
    case NAVIGATE_TO_PAGE: return Object.assign({}, state, action.page, {currentPath: action.currentPath});
    case BREAKING_NEWS_UPDATED: return Object.assign({}, state, {breakingNews: action.stories});
    default: return state;
  }
}

function createQtStore(customReducers, initialValue) {
  return createStore(internalReducers, Object.assign({currentPath: window.location.pathname}, initialValue));
}

exports.createStore = createQtStore;
