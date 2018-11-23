const {createStore} = require("redux");

exports.getDefaultState = function(result) {
  return {
    qt: { config: result.config },
    header: {
      isSidebarVisible: false,
      isSearchFormVisible: false
    }
  };
}

exports.createStoreFromMe = function(result, customQt, opts = {}) {
  const defaultState = getDefaultState(result);
  const qt =  Object.assign({}, defaultState.qt, opts, customQt);
  const finalState = Object.assign({}, defaultState, {qt});

  return createStore((state) => state, finalState);
}