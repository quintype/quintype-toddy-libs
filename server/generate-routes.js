// The below code dynamically generates routes based on the config
// A section sect will generate three urls:
// /sect, /sect/:storySlug, /sect/*/:storySlug
const flatMap = require('array.prototype.flatmap');

exports.generateSectionPageRoutes = function generateSectionPageRoutes(config, opts = {}) {
  const sectionsById = config.sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});

  return flatMap(config.sections || [], section => generateSectionPageRoute(section, sectionsById, opts))
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
    routes = flatMap(routes, route => [sectionPageRoute(route, params), addSectionPrefix(route, params)]);
  else
    routes = flatMap(routes, route => [sectionPageRoute(route, params)]);

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

exports.generateStoryPageRoutes = function generateStoryPageRoutes(config, {withoutParentSection} = {}) {
  const parentSections = config.sections.filter((section) => withoutParentSection || !section["parent-id"]);
  return flatMap(parentSections, (section) => [storyPageRoute(`/${section.slug}/:storySlug`), storyPageRoute(`/${section.slug}/*/:storySlug`)]);
}

function storyPageRoute(path) {
  return {
    pageType: 'story-page',
    exact: true,
    path: path
  }
}
