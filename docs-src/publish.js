const templatePath = "./node_modules/better-docs";

const path = require("jsdoc/path");
const helper = require("jsdoc/util/templateHelper");
const fs = require("jsdoc/fs");
const logger = require("jsdoc/util/logger");

const absoluteTemplatePath = path.getResourcePath(templatePath);
const template = require(`${absoluteTemplatePath}/publish`);

exports.publish = async function(docs, opts, root) {
  await template.publish.call(
    this,
    docs,
    { ...opts, template: absoluteTemplatePath },
    root
  );
  const files = Object.values(helper.longnameToUrl).filter(
    file => file.endsWith(".html") && !file.endsWith(".js.html")
  );
  const sitemapRoot = opts.sitemapRoot || "";
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${sitemapRoot}/</loc></url>
${files.map(file => `<url><loc>${sitemapRoot}/${file}</loc></url>`).join("\n")}
</urlset>`;
  const sitemapPath = path.join(
    path.normalize(opts.destination),
    "sitemap.xml"
  );
  fs.writeFileSync(sitemapPath, sitemapContent, "utf8");
  logger.info("Finished Generating Sitemap");
};
