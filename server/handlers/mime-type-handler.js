exports.addStaticPageMimeType = function addStaticPageMimeType({
  res,
  page = {},
}) {
  const { metadata = {} } = page;
  let { "mime-type": mimeType } = metadata;

    console.log(`XXX `, metadata);


    /* Default mime type to "text/html" if none present in the response */
  if (!mimeType) {
    mimeType = "text/html";
  }

  res.setHeader("Content-Type", mimeType);
  console.log(`YYYY --> `, mimeType);
  return res;
};
