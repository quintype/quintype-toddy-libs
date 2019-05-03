// The below code dynamically generates routes based on the config
// A section sect will generate three urls:
// /sect, /sect/:storySlug, /sect/*/:storySlug
const _ = require("lodash");

exports.generateSectionPageRoutes = function generateSectionPageRoutes(config, opts = {}) {
  const sections = config.getDomainSections(opts.domainSlug);

  const sectionsById = _(sections).reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});

  return _(sections)
    .flatMap((section) => generateSectionPageRoute(section, sectionsById, opts))
    .value();
}

function generateSectionPageRoute(section, sectionsById, opts) {
  const params = { sectionId: section.id };
  if(section.collection)
    params.collectionSlug = section.collection.slug

  var slug = section.slug;

  if(section["parent-id"]) {
    var currentSection = section;
    var depth = 0;
    while (currentSection["parent-id"] && depth++ < 5) {
      currentSection = sectionsById[currentSection["parent-id"]] || {slug: 'invalid'};
      slug = `${currentSection.slug}/${slug}`;
    }
  }

  let routes = [];
  if(section["parent-id"] && opts.secWithoutParentPrefix)
    routes = [section.slug, slug];
  else
    routes = [slug];

  if(opts.addSectionPrefix)
    routes = _.flatMap(routes, route => [sectionPageRoute(route, params), addSectionPrefix(route, params)]);
  else
    routes = _.flatMap(routes, route => [sectionPageRoute(route, params)]);

  return routes;
}

function addSectionPrefix(route, params) {
  return sectionPageRoute(`section/${route}`, params);
}

function sectionPageRoute(route, params) {
  return {
    pageType: "section-page",
    exact: true,
    path: `/${route}`,
    params: params
  }
}

exports.generateStoryPageRoutes = function generateStoryPageRoutes(config, {withoutParentSection, domainSlug} = {}) {
  const sections = config.getDomainSections(domainSlug);
  return _(sections)
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
