const PAGE_TYPE = {
  HOME_PAGE: "home-page",
  SECTION_PAGE: "section-page",
  TAG_PAGE: "tag-page",
  AUTHOR_PAGE: "author-page",
  SEARCH_PAGE: "search-page",
  STORY_PAGE: "story-page",
  CATALOG_PAGE: "catalog-page",
  STORY_PUBLIC_PREVIEW_PAGE: "story-public-preview-page",
  STORY_PREVIEW: "story-preview-page",
  HOME_PREVIEW: "home-preview-page",
  STATIC_PAGE: "static-page",
  COLLECTION_PAGE: "collection-page",
  VISUAL_STORY_PAGE: "visual-story",
  USER_DETAILS: "user-details",
  SUBSCRIPTION: "subscription",
};

const MOCK_WHITELIST_MOBILE_CONFIG = (pageType) => {
  switch (pageType) {
    case "config":
      return ["cdn-image"];

    case PAGE_TYPE.HOME_PAGE:
    case PAGE_TYPE.SECTION_PAGE:
    case PAGE_TYPE.COLLECTION_PAGE:
      return {
        collection: ["summary", "total-count", "items"],
        navigationMenu: [
          "menu-group-slug",
          "title",
          "item-type",
          "section-slug",
          "tag-slug",
          "url",
          "children",
          "completeUrl",
          "isExternalLink",
          "section-name",
        ],
        section: "all",
      };

    case PAGE_TYPE.STORY_PAGE:
      return {
        data: {
          story: [
            "updated-at",
            "seo",
            "assignee-id",
            "author-name",
            "tags",
            "headline",
            "storyline-id",
            "votes",
            "story-content-id",
            "slug",
            "last-published-at",
            "subheadline",
            "alternative",
            "sections",
            "story-audio",
            "read-time",
            "access-level-value",
            "content-created-at",
            "owner-name",
            "custom-slug",
            "push-notification",
            "publisher-id",
            "hero-image-metadata",
            "comments",
            "word-count",
            "entities",
            "published-at",
            "is-live-blog",
            "breaking-news-linked-story-id",
            "storyline-title",
            "summary",
            "push-notification-title",
            "external-id",
            "canonical-url",
            "is-amp-supported",
            "autotags",
            "linked-entities",
            "status",
            "hero-image-attribution",
            "bullet-type",
            "id",
            "hero-image-s3-key",
            "contributors",
            "associated-series-collection-ids",
            "cards",
            "url",
            "story-version-id",
            "content-type",
            "content-updated-at",
            "author-id",
            "owner-id",
            "linked-story-ids",
            "access",
            "promotional-message",
            "asana-project-id",
            "first-published-at",
            "hero-image-caption",
            "version",
            "story-template",
            "sequence-no",
            "created-at",
            "authors",
            "metadata",
            "publish-at",
            "assignee-name",
          ],
        },
      };

    case PAGE_TYPE.AUTHOR_PAGE:
      return {
        author: [
          "slug",
          "name",
          "avatar-url",
          "bio",
          "id",
          "avatar-s3-key",
          "twitter-handle",
          "stats",
          "metadata",
        ],
      };

    case PAGE_TYPE.TAG_PAGE:
      return {
        tag: "all",
        tagName: "all",
        tagDescription: "all",
        tagSlug: "all",
        stories: "all",
      };
    default:
      return {};
  }
};

module.exports = {
  MOCK_WHITELIST_MOBILE_CONFIG,
};
