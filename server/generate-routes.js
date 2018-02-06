// The below code dynamically generates routes based on the config
// A section sect will generate three urls:
// /sect, /sect/:storySlug, /sect/*/:storySlug
const _ = require("lodash");

exports.generateSectionPageRoutes = function generateSectionPageRoutes(config, opts = {}) {
  const sectionsById = _(config.sections).reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});

  return _(config.sections)
    .flatMap((section) => sectionPageRoute(section, sectionsById, opts))
    .value();
}

function sectionPageRoute(section, sectionsById, opts) {
  const params = { sectionId: section.id };
  if(section.collection)
    params.collectionSlug = section.collection.slug

  const commonParams = {
    pageType: "section-page",
    exact: true,
    params: params
  };

  var slug = section.slug;

  const routes = [Object.assign({path: `/${slug}`}, commonParams)];
  if(opts.addSectionPrefix) {
    routes.push(Object.assign({path: `/section/${slug}`}, commonParams));
  }

  if(section["parent-id"]) {
    var currentSection = section;
    var depth = 0;
    while (currentSection["parent-id"] && depth++ < 5) {
      currentSection = sectionsById[currentSection["parent-id"]] || {slug: 'invalid'};
      slug = `${currentSection.slug}/${slug}`;
    }

    routes.push(Object.assign({path: `/${slug}`}, commonParams));
    if(opts.addSectionPrefix) {
      routes.push(Object.assign({path: `/section/${slug}`}, commonParams));
    }
  }

  return routes;
}

exports.generateStoryPageRoutes = function generateStoryPageRoutes(config, {withoutParentSection} = {}) {
  return _(config.sections)
    .filter((section) => withoutParentSection || !section["parent-id"])
    .flatMap((section) => [storyPageRoute(`/${section.slug}/:storySlug`), storyPageRoute(`/${section.slug}/*/:storySlug`)])
    .value();
}

function storyPageRoute(path) {
  return {
    pageType: 'story-page',
    exact: true,
    path: path
  }
}
