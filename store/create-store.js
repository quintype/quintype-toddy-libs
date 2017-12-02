import { createStore, combineReducers } from 'redux';
import { NAVIGATE_TO_PAGE } from '@quintype/components/store/actions';
import { ComponentReducers } from '@quintype/components/store/reducers';

function internalReducers(state = {}, action) {
  switch (action.type) {
    case NAVIGATE_TO_PAGE: return Object.assign({}, state, action.page, {currentPath: action.currentPath});
    default: return state;
  }
}

export function createQtStore(customReducers, initialValue) {
  const reducers = combineReducers(Object.assign({
    qt: internalReducers
  }, ComponentReducers, customReducers));
  const initialState = Object.assign({currentPath: window.location.pathname}, initialValue);
  return createStore(reducers, {qt: initialState});
}
