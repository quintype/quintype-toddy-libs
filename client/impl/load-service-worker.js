import { SERVICE_WORKER_UPDATED } from '@quintype/components/store/actions';

export function registerServiceWorker({enableServiceWorker = false, serviceWorkerLocation = "/service-worker.js", navigator = global.navigator}) {
  if(enableServiceWorker && navigator.serviceWorker) {
    return navigator.serviceWorker.register(serviceWorkerLocation)
  } else {
    return Promise.resolve(null)
  }
}

export function setupServiceWorkerUpdates(serviceWorkerPromise, app, store, page) {
  if(!serviceWorkerPromise)
    return Promise.resolve();

  return serviceWorkerPromise
    .then(registration => {
      if(!registration)
        return;

      if(registration.update) {
        app.updateServiceWorker = () => registration.update().then(() => store.dispatch({type: SERVICE_WORKER_UPDATED}));
      }

      checkForServiceWorkerUpdates(app, page);

      return registration;
    });
}

export function checkForServiceWorkerUpdates(app, page) {
  if(page.appVersion && app.getAppVersion && app.getAppVersion() < page.appVersion) {
    console && console.log("Updating the Service Worker");
    app.updateServiceWorker && app.updateServiceWorker();
  }

  /* Check if the config is updated and update the service worker if true */

  caches && caches.match('/route-data.json', {'ignoreSearch': true})
    .then((response) => {
      if (response) {
        return response.json()
      }
    })
    .then((cachedData = {}) => {
      const {config: {'theme-attributes': cacheThemeAttributes = {}} = {}} = cachedData;
      const {config: {'theme-attributes': pageThemeAttributes = {}} = {}} = page;
      const cacheConfigTime = cacheThemeAttributes['cache-burst'] ? new Date(cacheThemeAttributes['cache-burst']) : 0;
      const pageConfigTime = pageThemeAttributes['cache-burst'] ? new Date(pageThemeAttributes['cache-burst']) : 0;
      if((pageConfigTime - cacheConfigTime) > 0) {
        app.updateServiceWorker && app.updateServiceWorker();
      }

    });

  return page;
}
