const _ = require('lodash');

exports.addCacheHeadersToResult = function addCacheHeadersToResult(
  res,
  cacheKeys,
  cdnProvider = 'cloudflare'
) {
  if (cacheKeys) {
    if (cacheKeys === 'DO_NOT_CACHE') {
      res.setHeader('Cache-Control', 'private,no-cache,no-store,max-age=0');
      cdnProvider === 'akamai' &&
        res.setHeader('Edge-Control', 'private,no-cache,no-store,max-age=0');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Surrogate-Control', 'private,no-cache,no-store,max-age=0');
      res.setHeader(
        'Content-Security-Policy',
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
        'Cache-Control',
        'public,max-age=15,s-maxage=900,stale-while-revalidate=1000,stale-if-error=14400'
      );
      cdnProvider === 'akamai' &&
        res.setHeader(
          'Edge-Control',
          'public,maxage=900,stale-while-revalidate=1000,stale-if-error=14400'
        );
      res.setHeader('Vary', 'Accept-Encoding');

      // Cloudflare Headers
      res.setHeader(
        'Cache-Tag',
        _(cacheKeys)
          .uniq()
          .join(',')
      );

      //Akamai Headers
      cdnProvider === 'akamai' &&
        res.setHeader(
          'Edge-Cache-Tag',
          _(cacheKeys)
            .uniq()
            .join(',')
        );

      // Fastly Header
      res.setHeader(
        'Surrogate-Control',
        'public,max-age=240,stale-while-revalidate=300,stale-if-error=14400'
      );
      res.setHeader(
        'Surrogate-Key',
        _(cacheKeys)
          .uniq()
          .join(' ')
      );
      res.setHeader(
        'Content-Security-Policy',
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
    res.setHeader(
      'Cache-Control',
      'public,max-age=15,s-maxage=60,stale-while-revalidate=150,stale-if-error=3600'
    );
    cdnProvider === 'akamai' &&
      res.setHeader(
        'Edge-Control',
        'public,maxage=60,stale-while-revalidate=150,stale-if-error=3600'
      );
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader(
      'Surrogate-Control',
      'public,max-age=15,s-maxage=60,stale-while-revalidate=150,stale-if-error=3600'
    );
    res.setHeader(
      'Content-Security-Policy',
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
