var assert = require('assert');

const {getClientImpl, Client, Story, Author, Member, Collection, CustomPath} = require("../../server/impl/api-client-impl");

describe('ApiClient', function() {
  describe('getClient', function() {
    it("returns a cachedSecondaryClient if present", function() {
      const expectedClient = new Client("foo.staging.quintype.io", true)
      const client = getClientImpl({}, {"foo.com": expectedClient}, "foo.com");
      assert.equal(expectedClient, client);
    });

    it('creates a temporary client if it matches a string', function() {
      const client = getClientImpl({host_to_automatic_api_host: ["-web"]}, {}, "foo-web.staging.quintype.io");
      assert.equal("https://foo.staging.quintype.io", client.baseUrl);
    });

    it('creates a temporary client if it matches a string with a .', function() {
      const client = getClientImpl({host_to_automatic_api_host: [".madrid"]}, {}, "foo.madrid.quintype.io");
      assert.equal("https://foo.quintype.io", client.baseUrl);
    });

    it("creates a temporary client if host_to_api_host_is set", function() {
      const client = getClientImpl({host_to_api_host: {"foo.madrid.quintype.io": "https://foo.quintype.io"}}, {}, "foo.madrid.quintype.io");
      assert.equal("https://foo.quintype.io", client.baseUrl);
    })

    it("returns null if no client is found", function() {
      const client = getClientImpl({}, {}, "www.unknown.com");
      assert.equal(null, client);
    });
  });

  describe("caching", function() {
    it("returns cache keys for the story", function() {
      const story = Story.build({id: "264f46f9-e624-4718-b391-45e4bca7aeb6", authors: [{id: 42}]})
      assert.deepEqual(["s/1/264f46f9", "a/1/42"], story.cacheKeys(1));
    })

    it("returns cache keys for a collection", function() {
      const collection = Collection.build({
        id: "42",
        items: [{type: "story", story: {id: "264f46f9-e624-4718-b391-45e4bca7aeb6"}},]
      })
      assert.deepEqual(["c/1/42", "s/1/264f46f9"], collection.cacheKeys(1));
    })

    it("adds nested collections", function() {
      const collection = Collection.build({
        id: "42",
        items: [{type: "collection", id: "500", items: [{type: 'story', story: {id: "abcdef12"}}]}]
      });
      assert.deepEqual(["c/1/42", "c/1/500", "s/1/abcdef12"], collection.cacheKeys(1));
    })

    it("can also find the cache key for a sorter", function() {
      assert.equal("q/1/top/home", Story.sorterToCacheKey(1, "top"));
      assert.equal("q/1/top/section-15", Story.sorterToCacheKey(1, "top", 15));
    })
  })

  describe("Author", function() {
    it("returns cache keys", function() {
      const author = Author.build({ "id": 101 });
      assert.deepStrictEqual(["a/1/101"], author.cacheKeys(1));
    })

    it("returns cache keys as null if author is invalid", function() {
      const author = Author.build({});
      assert.deepStrictEqual(null, author.cacheKeys(1));
    })
  })

  describe("Custom urls", function() {
    it("returns cache keys", function() {
      const page = CustomPath.build({"id": 101});
      assert.deepStrictEqual(["u/1/101"], page.cacheKeys(1));
    })

    it("returns cache keys as null if page is invalid", function() {
      const page = CustomPath.build({});
      assert.deepStrictEqual(null, page.cacheKeys(1));
    })
  })

});
