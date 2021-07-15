/**
 * How quintype handles toggle between different CDN providers
 * - For now we have support for `Cloudflare` and `akamai`.
 * - The default CDN provider is set as `Cloudflare`.
 *
 *   How to toggle between cdn providers:
 *   - If your app is cloned from malibu then, in `malibu/app/server/app.js` pass `cdnProvider` with required value to `isomorphicRoutes`(No need to pass if `cloudflare` is your cdn provider).
 *   Note: Contact Quintype before switching the CDN.
 *
 *   ```javascript
 *   import { isomorphicRoutes } from "@quintype/framework/server/routes";
 *   isomorphicRoutes(app, {
 *   ...
 *   ...
 *   ...
 *   cdnProvider: "YOUR_CDN_PROVIDER_NAME",
 *   });
 *   ```
 *   - In `quintype-node-framework`, the functionality to set the required response headers is written in file: `server/handlers/cdn-caching.js`
 *   - If the cdn provider is `akamai`, then we are updating the response headers as below
 *   ```javascript
 *   res.setHeader("Edge-Control", "private,no-cache,no-store,max-age=0");
 *   res.setHeader("Edge-Control",`public,maxage=${sMaxAge},stale-while-revalidate=1000,stale-if-error=14400`);
 *   res.setHeader("Edge-Cache-Tag", _(cacheKeys).uniq().join(","));
 *   res.setHeader("Edge-Control","public,maxage=60,stale-while-revalidate=150,stale-if-error=3600");
 *   ```
 * @category Server
 * @module cdn-provider-toggle
 */

const { cache } = require("ejs");
const _ = require("lodash");

exports.addCacheHeadersToResult = function addCacheHeadersToResult({
  res,
  cacheKeys,
  cdnProvider = "cloudflare",
  config,
  sMaxAge = "900",
}) {
  let cdnProviderVal = null;
  cdnProviderVal =
    typeof cdnProvider === "function" && Object.keys(config).length > 0 ? cdnProvider(config) : cdnProvider;
  if (cacheKeys) {
    if (cacheKeys === "DO_NOT_CACHE") {
      res.setHeader("Cache-Control", "private,no-cache,no-store,max-age=0");
      cdnProviderVal === "akamai" && res.setHeader("Edge-Control", "private,no-cache,no-store,max-age=0");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader(
        "Content-Security-Policy",
        `default-src data: 'unsafe-inline' 'unsafe-eval' https: http:;` +
          `script-src data: 'unsafe-inline' 'unsafe-eval' https: http: blob:;` +
          `style-src data: 'unsafe-inline' https: http: blob:;` +
          `img-src data: https: http: blob:;` +
          `font-src data: https: http:;` +
          `connect-src https: wss: ws: http: blob:;` +
          `media-src https: blob: http:;` +
          `object-src https: http:;` +
          `child-src https: data: blob: http:;` +
          `form-action https: http:;` +
          `block-all-mixed-content;`
      );
    } else {
      res.setHeader(
        "Cache-Control",
        `public,max-age=15,s-maxage=${sMaxAge},stale-while-revalidate=1000,stale-if-error=14400`
      );
      cdnProviderVal === "akamai" &&
        res.setHeader("Edge-Control", `public,maxage=${sMaxAge},stale-while-revalidate=1000,stale-if-error=14400`);
      res.setHeader("Vary", "Accept-Encoding");

      // Cloudflare Headers
      res.setHeader("Cache-Tag", _(cacheKeys).uniq().join(","));

      //Akamai Headers
      cdnProviderVal === "akamai" && res.setHeader("Edge-Cache-Tag", _(cacheKeys).uniq().join(","));

      res.setHeader("Surrogate-Key", _(cacheKeys).uniq().join(" "));
      res.setHeader(
        "Content-Security-Policy",
        `default-src data: 'unsafe-inline' 'unsafe-eval' https: http:;` +
          `script-src data: 'unsafe-inline' 'unsafe-eval' https: http: blob:;` +
          `style-src data: 'unsafe-inline' https: http: blob:;` +
          `img-src data: https: http: blob:;` +
          `font-src data: https: http:;` +
          `connect-src https: wss: ws: http: blob:;` +
          `media-src https: blob: http:;` +
          `object-src https: http:;` +
          `child-src https: data: blob: http:;` +
          `form-action https: http:;` +
          `block-all-mixed-content;`
      );
    }
  } else {
    res.setHeader("Cache-Control", "public,max-age=15,s-maxage=60,stale-while-revalidate=150,stale-if-error=3600");
    cdnProviderVal === "akamai" &&
      res.setHeader("Edge-Control", "public,maxage=60,stale-while-revalidate=150,stale-if-error=3600");
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader(
      "Content-Security-Policy",
      `default-src data: 'unsafe-inline' 'unsafe-eval' https: http:;` +
        `script-src data: 'unsafe-inline' 'unsafe-eval' https: http: blob:;` +
        `style-src data: 'unsafe-inline' https: http: blob:;` +
        `img-src data: https: http: blob:;` +
        `font-src data: https: http:;` +
        `connect-src https: wss: ws: http: blob:;` +
        `media-src https: blob: http:;` +
        `object-src https: http:;` +
        `child-src https: data: blob: http:;` +
        `form-action https: http:;` +
        `block-all-mixed-content;`
    );
  }
  return res;
};
