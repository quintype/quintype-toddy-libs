const {createStore} = require("redux");

function getDefaultState(result) {
  return {
    qt: { config: result.config },
    header: {
      isSidebarVisible: false,
      isSearchFormVisible: false
    }
  };
}

function createBasicStore(result, customQt, opts = {}) {
  const defaultState = getDefaultState(result);
  const qt =  Object.assign({}, defaultState.qt, opts, customQt);
  const finalState = Object.assign({}, defaultState, {qt});

  return createStore((state) => state, finalState);
}

module.exports = {
  getDefaultState,
  createBasicStore
}