exports.addStaticPageMimeType = function addStaticPageMimeType({
  res,
  page = {},
}) {
  const { metadata = {} } = page;
  let { "mime-type": mimeType } = metadata;

  /* Default mime type to "text/html" if none present in the response */
  if (!mimeType) {
    mimeType = "text/html";
  }

  res.setHeader("Content-Type", mimeType);
  return res;
};
