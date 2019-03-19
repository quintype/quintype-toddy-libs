import { createStore, combineReducers } from 'redux';
import { NAVIGATE_TO_PAGE, SERVICE_WORKER_UPDATED } from '@quintype/components';
import { ComponentReducers } from '@quintype/components';

function internalReducers(state = {}, action) {
  switch (action.type) {
    case NAVIGATE_TO_PAGE: return Object.assign({}, state, action.page, {currentPath: action.currentPath});
    default: return state;
  }
}

function serviceWorkerStatusReducer(state = {updated: false}, action) {
  switch (action.type) {
    case SERVICE_WORKER_UPDATED:
      console && console.log("Service Worker Has Updated");
      return Object.assign({}, state, {updated: true});
    default:
      return state;
  }
}

export function createQtStore(customReducers, initialValue, {location = global.location}) {
  const reducers = combineReducers(Object.assign({
    qt: internalReducers,
    serviceWorkerStatus: serviceWorkerStatusReducer,
  }, ComponentReducers, customReducers));
  const initialState = Object.assign({currentPath: location.pathname}, initialValue);
  const store = createStore(reducers, {qt: initialState});
  store.initialReducer = reducers;
  return store;
}
