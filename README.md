# Quintype Toddy Libs

This is a set of libraries that is to be used to build a Quintype Node App. This README servers as documentation of the architecture. Please see [malibu](https://github.com/quintype/malibu) for a reference application using this architecture.

## Architecture

### Isomorphic flow

#### Server Side Flow

1. If no 'regular' route is caught, it goes to the isomorphic handler
2. The current route is matched via matchBestRoute (see routing)
3. If a route is matched, we load data via the `loadData(pageType)` function.
4. A redux store is created based on the loaded data
5. We render the `IsomorphicComponent`, which determines which page to render based on `pageType`, from the store

#### Client Side Flow

1. The `startApp()` function starts as soon as the JS loads (async)
2. The `startApp()` function calls `/route-data.json?route=/current/path`.
3. The server looks at `/current/path`, matching it against its known routes, and sends back the `pageType`, and data from `loadData(pageType)`
4. A redux store is created based on the loaded data
5. We render the `IsomorphicComponent`, which determines which page to render based on `pageType`, from the store

#### Links between pages

1. The client is loaded, and you click on a link, there should be no need to reload the page
2. Instead, the link should make a call to `/route-data.json?route=/current/path`, and continue from step 2 of client side app

#### Service Worker

1. Service Workers act as a proxy between your browser, and all network requests (including XHR, Assets, etc...). A service worker is registered by the `app.js`
2. When the service worker gets registered, it downloads a minimum set of files for offline use. Typically, this includes [/shell.html, app.js, app.css] and others
3. When you go to a page in the browser, the service worker wakes up. It decides if it can handle the request (by matching against the same routes), and renders the shell.html if possible. If shell.html is rendered, then global.qtLoadedFromShell is set to true
4. If the shell was rendered, the JS will wake up and continue with the client flow from step 4
5. If no shell was rendered, the call will fallback to the server, and proceed normally.

#### Service Worker - API Caching (not implemented in app)

1. TODO - Service workers can also cache API requests, so that your app works totally offline

### Routing

This app aims to be a Progressive Web App. Instead of guessing routes, it looks at the config to dynamically generate the required routes. For example, with sections /politics and /politics/karnataka, it will generate the following routes: [/politics, /politics/karnataka, /politics/:storySlug, /politics/*/:storySlug].

These routes are exposed via the `generateRoutes` function, and matched using the `matchBestRoute` function. This is embedded in three places:

* Server, for server side rendering
* The Service Worker, for deciding which pages are part of the PWA
* The Client js

## Implementing a new page

In your server.js, you will notice something like the following

```javascript
isomorphicRoutes(app, {
  generateRoutes: generateRoutes,
  loadData: loadData,
  pickComponent: pickComponent,
});
```

This highlights the three important places to put stuff for an isomorphic app

* Match the route against a `pageType`, typically in `app/server/routes.js` (see the routing section above)
* Load the Data Required for that `pageType`, typically in `app/server/load-data.js`. This returns a promise with required data.
* Render the correct component for that `pageType`, typically in `app/isomorphic/pick-component.js`. This must be a pure component

### Page Type Aliases

Sometimes, a page will have the same SEO characteristics as another page, but required different data loading logic. For example, a particular section may have some extra data, and a completely different layout.

In this case, the preferred solution is to use a different PAGE_TYPE, and the pass the following flags to the SEO module.

```javascript
new SEO({
  pageTypeAliases: {
    "awesome-page": "section-page"
  }
})
```
### Analytics

Currently, we trigger both Quintype analytics and GA when the page changes. The GA tracker looks for the default tracker, then looks for the tracker called `gtm1`.
You can stop the GA tracking behaviour if you set a global variable `qtNoAutomaticGATracking` to true. Keep in mind you'll have to implement your own ga tracking code.

### Useful Components

Please see https://github.com/quintype/quintype-node-components

## Forcing Updates

Since is difficult to force Service Workers to update, there is a provision to do such a thing. Add the following to the correct places. Whenever a change is to be forcefully pushed, update the version in app-version.js. The next AJAX page load via `/route-data.json` will force the service worker to update in the background (and the next refresh will have changes).

Ideally, you will have to push this after purging caches on /shell.html and the service worker.

```javascript
// app/isomorphic/app-version.js

module.exports = 1;

// app/server/app.js
import {isomorphicRoutes} from "@quintype/framework/server/routes";
isomorphicRoutes(app, {
  ...
  appVersion: require("../isomorphic/app-version")
  ...
});

// app/client/app.js
startApp(renderApplication, CUSTOM_REDUCERS, {
  ...
  appVersion: require("../isomorphic/app-version")
  ...
});

// views/js/service-worker.ejs
const REQUIRED_ASSETS = [
  {url: '/shell.html', revision: '<%= appVersion %>'},
  ...
];
```

## Structure of the /route-data.json

The response of the /route-data.json will look like the following:

```javascript
{
  appVersion: 42,
  title: "This is the title of the page",
  // When multi domain support is enabled, this will be the canonical url of the domainSlug.
  // See multi domain support for more information
  currentHostUrl: "https://canonical-root.your-host.com",
  primaryHostUrl: "https://www.your-host.com",
  // your loadData function is responsible for loading this entire data
  data: {
    pageType: "story-page",
    story: {}
  }
}
```

### Special Responses of /route-data.json

The response codes of /route-data.json are listed below

* 404 - Route data did not match something that loadData could handle. Either no route matched, or the route matched but loadData aborted. Possibly try bypassing the service worker to find a redirect or custom-url from server side.
* 200, but page.data. httpStatusCode = 301 - The server wants you to redirect (do window.location)
* 200 - This is an isomorphic page

## Configuration

Any yaml file you add to config is available as follows:

```javascript
const {some_config} = require('@quintype/framework/server/static-configuration')
```

## Proxying A Request to Another Host (for caching)

It is possible to forward requests to another host, and cache the results on our CDN. This can be done as follows in `app/server/app.js`.

```javascript
const {proxyGetRequest} = require('@quintype/framework/server/routes');

proxyGetRequest(app, "/path/to/:resource.json", (params) => `https://example.com/${params.resource}.json`, {logError})
```

The handler can return the following:
* null / undefined - The result will be a 503
* any truthy value - The result will be returned as a 200 with the result as content
* A url starting with http(s) - The URL will be fetched and content will be returned according to the above two rules

## Multi Domain Support

Multi domain support is achieved by assigning a section to a domain via the domain manager in the editor. Once this is done, add the following entries into your `publisher/config.yml`.

```yaml
# publisher/config.yml
domain_mapping:
  subdomain.my-domain.com: sub
  another.my-domain.com: another
```

Doing this will enable a field called `domainSlug` to be passed to various functions, such as `generateRoutes` and `loadData`. This can be used to load data specific to the domain.

Further, `/route-data.json` will have two more fields at the root level. `domainSlug`, which is the slug of the loaded domain. `currentHostUrl` specifies which domain you are on. The `currentHostUrl` is used by the link field to decide if it should do an ajax navigation or not.

## Visual Stories (amp stories)

In order to use the visual-stories, do the following in `app/server/app.js`

```javascript
import {enableVisualStories} from '@quintype/framework/server/visual-stories';

function renderVisualStory(res, story, {config, client}) {
  res.render("pages/visual-story", {
    seo: "",
    content: ReactDom.renderToStaticMarkup(<amp-story></amp-story>)
  })
}

enableVisualStories(app, renderVisualStory, {logError})
```

## Debugging

* In order to use `assetify` function, please annotate the application-js with id="app-js". The hostname specified here is assumed to be the cdn
* All code related to the browser loading the service worker can be found in [load-service-worker.js](client/load-service-worker.js)
* All code related to the service worker itself is found in [service-worker-helper.js](client/service-worker-helper.js)

## Miscellaneous

### Switching to generateCommonRoutes

Starting in `@quintype/framework` v3, we are introducing multi domain support. The configuration for section page locations is now controlled by the editor. Please switch to using `generateCommonRoutes` to generate story page, and section page routes.

```javascript
import {generateCommonRoutes} from "@quintype/framework/server/generate-routes";

export function generateRoutes(config, domainSlug) {
  return generateCommonRoutes(config, domainSlug, {
    sectionPageRoutes: true,
    storyPageRoutes: true
  })
}
```

### OneSignal Integration

OneSignal interferes with our service worker, so a few changes have to be made to enable PWA with OneSignal.

```javascript
// app/server/app.js

import {isomorphicRoutes} from "@quintype/framework/server/routes";
isomorphicRoutes(app, {
  ...
  oneSignalServiceWorkers: true
  ...
});

// app/client/app.js

startApp(renderApplication, CUSTOM_REDUCERS, {
  enableServiceWorker: true,
  serviceWorkerLocation: "/OneSignalSDKWorker.js", // OneSignal will automatically register the service worker
})
```
### FCM Integration

Steps to Integrate FCM in your project

1. While executing startApp in your project set enableFCM to true.

An Example
```
startApp(renderApplication, 
  CUSTOM_REDUCERS, 
  {
  enableServiceWorker: process.env.NODE_ENV === "production",  
  enableFCM: true,
  ...
})
```
2. publisher_config.yml should have the fcm configuration as below:
```
    fcm:
      message_sender_id: <MessageSenderId>
      serverKey: <ServerKey>
```

3. You should have service worker script named firebase-messaging-sw.js in /public

   Example of the script:

      ```
          importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js");
          importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js");
          firebase.initializeApp({
            messagingSenderId: <your message sender Id>
          });
          const messaging = firebase.messaging();
          function messageHandler(payload) {
            const data = payload["data"];

            var notificationTitle = data.title;
            var notificationOptions = {
              body: data.body,
              icon: data["hero_image_s3_url"],
              image: data["hero_image_s3_url"],
              data: data
            };

            return self.registration.showNotification(notificationTitle,
              notificationOptions);
          }
          messaging.setBackgroundMessageHandler(messageHandler);
      ```

4. Make sure that the page data should have config with key fcmMessageSenderId refer doStartApp function in app/client/start.js.

### Skipping loading data from /route-data.json

This can be used where `/route-data.json` is not accessible (example preview).

Add the following:

```html
<script type="text/javascript">
  var staticPageStoreContent = <%- JSON.stringify(store.getState()) -%>;
</script>
```

The store will be initialized from staticPageStoreContent

### Using Assets in JS and CSS

(to be documented)

## Minimizing Page Load Speed

Make sure you do all of the following techniques to reduce page load time (notes to document these later)

### Inline CSS

### Add a window.initialFetch to do a fetch in the background

### Add a initial-page to preRender chrome such as the menu without waiting for AJAX responses

```html
<script type="application/json" id="initial-page">{"config": {}}</script>
```

### Use static-page to show a full page (this will prevent fetchData from calling)

```html
<script type="application/json" id="static-page">{"config": {}}</script>
```

### Never require lodash directly. Always do lodash/get

### Do not use moment. Use date-fns

### LazyLoad Images

### Separate polyfills

### Use Link headers to do HTTP2 server push to prioritize important requests

Preloading app.js and /route-data.json can be triggered by passing preloadJS true, and preloadRouteData true to isomorphic handler

## Options

### manifest-fn

### forwardAmp

### multiple publishers

FIXME: Write notes on `host_to_api_host`, `host_to_automatic_api_host` and `skip_warm_config`

### forwardFavicon

## Optimising front-end javascript

1. https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking/



## Migration to framework@3

- Run the following to execute the script:
```sh
sh <(curl https://raw.githubusercontent.com/quintype/quintype-node-framework/master/scripts/framework-2-to-3-migration)
```
- Verify Changes with `git diff --cached`

## References

* This architecture is heavily influenced by the method described in this [video](https://www.youtube.com/watch?v=atUdVSuNRjA)
* Code for the available video is available [here](https://github.com/gja/pwa-clojure)
* I know there is a good tutorial video I've seen. But I can't remember where.
* Great [intro to pwa](https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/)
