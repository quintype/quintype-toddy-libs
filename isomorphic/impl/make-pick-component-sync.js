function makePickComponentSync(pickComponent) {
  const loadedComponents = {};

  const wrappedPickComponent = function(pageType) {
    return loadedComponents[pageType];
  };

  wrappedPickComponent.preloadComponent = function(pageType, subPageType) {
    if (loadedComponents[pageType]) {
      return Promise.resolve();
    }
    return Promise.resolve(pickComponent(pageType, subPageType))
      .then(component => {
        loadedComponents[pageType] = component;
      })
      .then(() => Promise.resolve());
  };

  return wrappedPickComponent;
}

exports.makePickComponentSync = makePickComponentSync;
