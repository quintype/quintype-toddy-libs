const assert = require('assert');
const { Config } = require('../../server/impl/api-client-impl');
const { generateSectionPageRoutes, generateStoryPageRoutes, generateCommonRoutes } = require("../../server/generate-routes");

describe('generateRoutes', function () {
  it("generates section routes correctly", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }]
    })))
  });

  it("generates section routes correctly with section prefix", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/section/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/section/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }],
    }), { addSectionPrefix: true }))
  });

  it("generates section with collection slug", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42, collectionSlug: "sect" } },
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect", collection: { slug: "sect" } }]
    })))
  });

  it("generates extra sub section route when secWithoutParentPrefix is true", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }]
    }), { secWithoutParentPrefix: true }))
  });

  it("generates extra sub section route and with section prefix when both secWithoutParentPrefix and addSectionPrefix is true", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/section/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/section/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/section/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
    ];

    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }]
    }), { secWithoutParentPrefix: true, addSectionPrefix: true }))
  });


  it("generates story routes correctly", function () {
    const expectedRoutes = [
      { path: "/sect/:storySlug", pageType: "story-page", exact: true },
      { path: "/sect/*/:storySlug", pageType: "story-page", exact: true },
    ];
    assert.deepEqual(expectedRoutes, generateStoryPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }]
    })))
  });

  it("adds routes for subsections when withoutParentSection is set", function () {
    const expectedRoutes = [
      { path: "/sect/:storySlug", pageType: "story-page", exact: true },
      { path: "/sect/*/:storySlug", pageType: "story-page", exact: true },
      { path: "/sub-sect/:storySlug", pageType: "story-page", exact: true },
      { path: "/sub-sect/*/:storySlug", pageType: "story-page", exact: true },
    ];
    assert.deepEqual(expectedRoutes, generateStoryPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect" }, { id: 43, slug: "sub-sect", "parent-id": 42 }]
    }), { withoutParentSection: true }))
  });

  it("does not go into infinite loop if sections are recursive", function () {
    const expectedRoutes = [
      { path: "/sect/sect/sect/sect/sect/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } }
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect", "parent-id": 42 }]
    })));
  });

  it("handles missing parents correctly", function () {
    const expectedRoutes = [
      { path: "/invalid/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } }
    ];
    assert.deepEqual(expectedRoutes, generateSectionPageRoutes(Config.build({
      sections: [{ id: 42, slug: "sect", "parent-id": 1 }]
    })));
  })
});

describe("MultiDomain Support", function () {
  const config = {
    sections: [
      { id: 42, slug: "sect", 'domain-slug': 'subdomain' },
      { id: 43, slug: "sub-sect", 'domain-slug': 'subdomain', "parent-id": 42 },
      { id: 44, slug: "sect2", 'domain-slug': null },
      { id: 45, slug: "sub-sect2", "parent-id": 44, 'domain-slug': null },
    ]
  };

  it("generate routes given a domainSlug", function () {
    const expectedRoutes = [
      { path: "/sect", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/sect/sub-sect", pageType: "section-page", exact: true, params: { sectionId: 43 } },
    ];
    const allRoutes = generateSectionPageRoutes(Config.build(config), { domainSlug: 'subdomain' });
    assert.deepEqual(expectedRoutes, allRoutes);
  });

  it("generates routes for null domain", function () {
    const expectedRoutes = [
      { path: "/sect2", pageType: "section-page", exact: true, params: { sectionId: 44 } },
      { path: "/sect2/sub-sect2", pageType: "section-page", exact: true, params: { sectionId: 45 } },
    ];
    const allRoutes = generateSectionPageRoutes(Config.build(config), { domainSlug: null });
    assert.deepEqual(expectedRoutes, allRoutes);
  });

  it("generates story page routes given a domain Slug", function () {
    const expectedRoutes = [
      { path: "/sect/:storySlug", pageType: "story-page", exact: true },
      { path: "/sect/*/:storySlug", pageType: "story-page", exact: true },
    ];
    const allRoutes = generateStoryPageRoutes(Config.build(config), { domainSlug: 'subdomain' });
    assert.deepEqual(expectedRoutes, allRoutes);
  });
})

describe("generateCommonRoutes", function() {
  it("generates section and story page routes", function() {
    const config = Config.build({ sections: [{ id: 42, "section-url": "https://quintype-demo.quintype.io/photos"}]})

    assert.deepEqual(
      [{ path: "/photos", pageType: "section-page", exact: true, params: { sectionId: 42 } }],
      generateCommonRoutes(config, undefined, { allRoutes: false, sectionPageRoutes: true })
    )

    assert.deepEqual(
      [{ path: "/photos(/.*)?/:storySlug", pageType: "story-page", exact: true }],
      generateCommonRoutes(config, undefined, { allRoutes: false, storyPageRoutes: true })
    )
  })

  it("picks up the collection slug if there is one present in the section", function() {
    const config = Config.build({ sections: [{ id: 42, "section-url": "https://quintype-demo.quintype.io/photos", collection: {slug: "photos"} }] })

    assert.deepEqual(
      [{ path: "/photos", pageType: "section-page", exact: true, params: { sectionId: 42, collectionSlug: "photos" } }],
      generateCommonRoutes(config, undefined, { allRoutes: false, sectionPageRoutes: true })
    )
  })

  it("only picks the sections from the correct domain", function() {
    const config = Config.build({ sections: [{ id: 42, "section-url": "https://quintype-demo.quintype.io/photos", 'domain-slug': 'sub' }] })

    assert.deepEqual(
      [],
      generateCommonRoutes(config, null, { allRoutes: false, sectionPageRoutes: true })
    )

    assert.deepEqual(
      [{ path: "/photos", pageType: "section-page", exact: true, params: { sectionId: 42 } }],
      generateCommonRoutes(config, 'sub', { allRoutes: false, sectionPageRoutes: true })
    )
  })

  it("puts section urls before the story urls", function() {
    const config = Config.build({ sections: [
      { id: 42, "section-url": "https://quintype-demo.quintype.io/photos" },
      { id: 43, "section-url": "https://quintype-demo.quintype.io/photos/gallery" },
    ]});

    assert.deepEqual([
      { path: "/photos", pageType: "section-page", exact: true, params: { sectionId: 42 } },
      { path: "/photos/gallery", pageType: "section-page", exact: true, params: { sectionId: 43 } },
      { path: "/photos(/.*)?/:storySlug", pageType: "story-page", exact: true },
      { path: "/photos/gallery(/.*)?/:storySlug", pageType: "story-page", exact: true },
      ], generateCommonRoutes(config, undefined, { allRoutes: false, sectionPageRoutes: true, storyPageRoutes: true })
    )
  });

  it("removes /section from the story route", function () {
    const config = Config.build({ sections: [{ id: 42, "section-url": "https://quintype-demo.quintype.io/section/photos" }] })

    assert.deepEqual(
      [{ path: "/section/photos", pageType: "section-page", exact: true, params: { sectionId: 42 } }],
      generateCommonRoutes(config, undefined, { allRoutes: false, sectionPageRoutes: true })
    )

    assert.deepEqual(
      [{ path: "/photos(/.*)?/:storySlug", pageType: "story-page", exact: true }],
      generateCommonRoutes(config, undefined, { allRoutes: false, storyPageRoutes: true })
    )
  });

  it("generates things correctly if the section-url is missing", function() {
    const config = Config.build({ sections: [{ id: 42, slug: "photos" }] })

    assert.deepEqual(
      [{ path: "/photos(/.*)?/:storySlug", pageType: "story-page", exact: true }],
      generateCommonRoutes(config, undefined, { allRoutes: false, storyPageRoutes: true })
    )

    assert.deepEqual(
      [{ path: "/photos", pageType: "section-page", exact: true, params: { sectionId: 42 } }],
      generateCommonRoutes(config, undefined, { allRoutes: false, sectionPageRoutes: true })
    )
  });

  it("generates the home page route", function() {
    const config = Config.build({ domains: [{ "slug": "sub", "home-collection-id": 1234 }], sections: [] });

    assert.deepEqual(
      [{ path: "/", pageType: "home-page", exact: true, params: { collectionSlug: "home" } }],
      generateCommonRoutes(config, undefined, { allRoutes: false, homePageRoute: true })
    );

    assert.deepEqual(
      [{ path: "/", pageType: "home-page", exact: true, params: { collectionSlug: "home" } }],
      generateCommonRoutes(config, null, { allRoutes: false, homePageRoute: true })
    );

    assert.deepEqual(
      [{ path: "/", pageType: "home-page", exact: true, params: { collectionSlug: "1234" } }],
      generateCommonRoutes(config, "sub", { allRoutes: false, homePageRoute: true })
    );
  })
})
