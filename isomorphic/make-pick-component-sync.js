function makePickComponentSync(pickComponent) {
	const loadedComponents = {};
	const wrappedPickComponent = function(pageType) {
		return loadedComponents[pageType];
	}
	wrappedPickComponent.preloadComponent = function(pageType) {
		if(loadedComponents[pageType]) {
			return Promise.resolve(loadedComponents[pageType])
		} else {
			return Promise.resolve(pickComponent(pageType)).then(component => { 
				loadedComponents[pageType] = component;
				return component;
			})
		}
	}

	return wrappedPickComponent;
}

exports.makePickComponentSync = makePickComponentSync;