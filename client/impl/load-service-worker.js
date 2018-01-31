import { SERVICE_WORKER_UPDATED } from '@quintype/components/store/actions';

// istanbul ignore next
export function registerServiceWorker({enableServiceWorker = false, serviceWorkerLocation = "/service-worker.js"}) {
  if(enableServiceWorker && global.navigator.serviceWorker) {
    return global.navigator.serviceWorker.register(serviceWorkerLocation)
  } else {
    return Promise.resolve(null)
  }
}

export function setupServiceWorkerUpdates(serviceWorkerPromise, app, store, page) {
  if(!serviceWorkerPromise)
    return;

  serviceWorkerPromise
    .then(registration => {
      if(!registration)
        return;

      if(registration.update) {
        app.updateServiceWorker = () => registration.update().then(() => store.dispatch({type: SERVICE_WORKER_UPDATED}));
      }

      checkForServiceWorkerUpdates(app, page);
    });
}

export function checkForServiceWorkerUpdates(app, page) {
  if(page.appVersion && app.getAppVersion && app.getAppVersion() < page.appVersion) {
    console && console.log("Updating the Service Worker");
    app.updateServiceWorker && app.updateServiceWorker();
  }

  return page;
}
