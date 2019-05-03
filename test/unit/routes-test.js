var assert = require('assert');
const { Config } = require('../../server/impl/api-client-impl');
const {matchBestRoute, matchAllRoutes} = require("../../isomorphic/match-best-route");
const {generateSectionPageRoutes, generateStoryPageRoutes} = require("../../server/generate-routes");

describe('routes', function() {
  describe('matchBestRoute', function() {
    const routes = [
      {path: "/", pageType: "home-page", exact: true},
      {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
      {path: "/sect/sub-sect", pageType: "section-page", exact: true},
      {path: "/sect/:storySlug", pageType: "story-page", exact: true},
      {path: "/sect/*/:storySlug", pageType: "story-page", exact: true},
    ];

    it('matches the home page', function() {
      assert.equal("home-page", matchBestRoute("/", routes).pageType);
    });

    it('matches subsection-page', function() {
      assert.equal("section-page", matchBestRoute("/sect/sub-sect", routes).pageType);
    });

    it('matches story page', function() {
      const {pageType, params} = matchBestRoute("/sect/story", routes);
      assert.equal("story-page", pageType);
      assert.equal("story", params.storySlug);
    });

    it('matches story page with extra date info', function() {
      const {pageType, params} = matchBestRoute("/sect/2017/01/01/story", routes);
      assert.equal("story-page", pageType);
      assert.equal("story", params.storySlug);
    });

    it('matches route params', function() {
      const {pageType, params} = matchBestRoute("/sect", routes);
      assert.equal("section-page", pageType);
      assert.equal(42, params.sectionId);
    });

    it('returns undefined if there is no match', function() {
      assert(!matchBestRoute("/not-found", routes));
    });

    it('matches even if there is no /', function() {
      assert.equal("section-page", matchBestRoute("sect/sub-sect", routes).pageType);
    });
  });

  describe('generateRoutes', function() {
    it("generates section routes correctly", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}]
      })))
    });

    it("generates section routes correctly with section prefix", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/section/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
        {path: "/section/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}],
      }), {addSectionPrefix: true}))
    });

    it("generates section with collection slug", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42, collectionSlug: "sect"}},
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect", collection: {slug: "sect"}}]
      })))
    });

    it("generates extra sub section route when secWithoutParentPrefix is true", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
        {path: "/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}]
      }), {secWithoutParentPrefix: true}))
    });

    it("generates extra sub section route and with section prefix when both secWithoutParentPrefix and addSectionPrefix is true", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/section/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
        {path: "/section/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
        {path: "/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
        {path: "/section/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
      ];

      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}]
      }), {secWithoutParentPrefix: true, addSectionPrefix: true}))
    });


    it("generates story routes correctly", function() {
      const expectedRoutes = [
        {path: "/sect/:storySlug", pageType: "story-page", exact: true},
        {path: "/sect/*/:storySlug", pageType: "story-page", exact: true},
      ];
      assert.deepEqual(expectedRoutes, generateStoryPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}]
      })))
    });

    it("adds routes for subsections when withoutParentSection is set", function() {
      const expectedRoutes = [
        {path: "/sect/:storySlug", pageType: "story-page", exact: true},
        {path: "/sect/*/:storySlug", pageType: "story-page", exact: true},
        {path: "/sub-sect/:storySlug", pageType: "story-page", exact: true},
        {path: "/sub-sect/*/:storySlug", pageType: "story-page", exact: true},
      ];
      assert.deepEqual(expectedRoutes, generateStoryPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect"}, {id: 43, slug: "sub-sect", "parent-id": 42}]
      }), {withoutParentSection: true}))
    });

    it("does not go into infinite loop if sections are recursive", function() {
      const expectedRoutes = [
        {path: "/sect/sect/sect/sect/sect/sect", pageType: "section-page", exact: true, params: {sectionId: 42}}
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect", "parent-id": 42}]
      })));
    });

    it("handles missing parents correctly", function() {
      const expectedRoutes = [
        {path: "/invalid/sect", pageType: "section-page", exact: true, params: {sectionId: 42}}
      ];
      assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
        sections: [{id: 42, slug: "sect", "parent-id": 1}]
      })));
    })
  });

  describe("MultiDomain Support", function() {
    const config = {
      sections: [
        { id: 42, slug: "sect", 'domain-slug': 'subdomain' },
        { id: 43, slug: "sub-sect", 'domain-slug': 'subdomain', "parent-id": 42 },
        { id: 44, slug: "sect2", 'domain-slug': null },
        { id: 45, slug: "sub-sect2", "parent-id": 44, 'domain-slug': null },
      ]
    };

    it("generate routes given a domainSlug", function() {
      const expectedRoutes = [
        {path: "/sect", pageType: "section-page", exact: true, params: {sectionId: 42}},
        {path: "/sect/sub-sect", pageType: "section-page", exact: true, params: {sectionId: 43}},
      ];
      const allRoutes = generateSectionPageRoutes(Config.build(config), {domainSlug: 'subdomain'});
      assert.deepEqual(expectedRoutes, allRoutes);
    });

    it("generates routes for null domain", function() {
      const expectedRoutes = [
        {path: "/sect2", pageType: "section-page", exact: true, params: {sectionId: 44}},
        {path: "/sect2/sub-sect2", pageType: "section-page", exact: true, params: {sectionId: 45}},
      ];
      const allRoutes = generateSectionPageRoutes(Config.build(config), {domainSlug: null});
      assert.deepEqual(expectedRoutes, allRoutes);
    });

    it("generates story page routes given a domain Slug", function() {
      const expectedRoutes= [
        {path: "/sect/:storySlug", pageType: "story-page", exact: true},
        {path: "/sect/*/:storySlug", pageType: "story-page", exact: true},
      ];
      const allRoutes = generateStoryPageRoutes(Config.build(config), {domainSlug: 'subdomain'});
      assert.deepEqual(expectedRoutes, allRoutes);
    });
  })

  describe("matchAllRoutes", function() {
    it("matches all routes in order", function() {
      const routes = [
        {path: "/sect/sub-sect", pageType: "section-page", exact: true},
        {path: "/sect/:storySlug", pageType: "story-page", exact: true}
      ];

      assert.deepEqual(['section-page', 'story-page'], matchAllRoutes("/sect/sub-sect", routes).map(m => m.pageType));
    });
  })
});
