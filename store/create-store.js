import { createStore, combineReducers } from 'redux';
import { NAVIGATE_TO_PAGE, BREAKING_NEWS_UPDATED, CLIENT_SIDE_RENDERED } from './actions';

function internalReducers(state = {}, action) {
  switch (action.type) {
    case NAVIGATE_TO_PAGE: return Object.assign({}, state, action.page, {currentPath: action.currentPath});
    default: return state;
  }
}

function breakingNewsReducer(state = [], action) {
  switch (action.type) {
    case BREAKING_NEWS_UPDATED: return action.stories;
    default: return state;
  }
}

function clientSideRenderedReducer(state = false, action) {
  switch (action.type) {
    case CLIENT_SIDE_RENDERED: return true;
    default: return state;
  }
}

export function createQtStore(customReducers, initialValue) {
  const reducers = combineReducers(Object.assign({
    qt: internalReducers,
    breakingNews: breakingNewsReducer,
    clientSideRendered: clientSideRenderedReducer
  }, customReducers));
  const initialState = Object.assign({currentPath: window.location.pathname}, initialValue);
  return createStore(reducers, {qt: initialState});
}
