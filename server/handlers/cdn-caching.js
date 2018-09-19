const _ = require("lodash");

exports.defaultCacheHeaders = function defaultCacheHeaders(res){
  res.setHeader('Cache-Control', "no-cache, no-store,max-age=0,s-maxage=0,must-revalidate");
  res.setHeader('Vary', "Accept-Encoding");
  res.setHeader('Surrogate-Control', "no-cache, no-store, must-revalidate");
  return res;
}

exports.addCacheHeadersToResult = function addCacheHeadersToResult(res, cacheKeys) {
  if(cacheKeys) {
    res.setHeader('Cache-Control', "public,max-age=15,s-maxage=240,stale-while-revalidate=300,stale-if-error=14400");
    res.setHeader('Vary', "Accept-Encoding");

    // Cloudflare Headers
    res.setHeader('Cache-Tag', _(cacheKeys).uniq().join(","));
    
    // Fastly Header
    res.setHeader('Surrogate-Control', "public,max-age=240,stale-while-revalidate=300,stale-if-error=14400");
    res.setHeader('Surrogate-Key', _(cacheKeys).uniq().join(" "));
  }
  return res;
}