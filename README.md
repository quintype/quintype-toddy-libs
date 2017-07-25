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
3. When you go to a page in the browser, the service worker wakes up. It decides if it can handle the request (by matching against the same routes), and renders the shell.html if possible
4. If the shell was rendered, the JS will wake up and continue with the client flow from step 4
5. If no shell was rendered, the call will fallback to the server, and proceed normally.

#### Service Worker - API Caching (not implemented in app)

1. TODO - Service workers can also cache API requests, so that your app works totally offline

### Routing

This app aims to be a Progressive Web App. Instead of guessing routes, it looks at the config to dynamically generate the required routes. For example, with sections /politics and /politics/karnataka, it will generate the following routes: [/politics, /politics/karnataka, /politics/:storySlug, /politics/*/:storySlug].

These routes are exposed via the `generateRoutes` function, and matched using the `matchBestRoute` function. This is embedded in three places:

* Server, for server side rendering
* The Service Worker, for deciding which pages are part of the PWA
* The Client js,

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

### References

* This architecture is heavily influenced by the method described in this [video](https://www.youtube.com/watch?v=atUdVSuNRjA)
* Code for the available video is available [here](https://github.com/gja/pwa-clojure)
* I know there is a good tutorial video I've seen. But I can't remember where.
* Great [intro to pwa](https://developers.google.com/web/fundamentals/getting-started/codelabs/your-first-pwapp/)
