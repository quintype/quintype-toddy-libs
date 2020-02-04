/**
 * ```javascript
 * import { pickComponentHelper } from "@quintype/framework/isomorphic/pick-component-helper";
 * ```
 * @category Isomorphic
 * @module pick-component-helper
 */

/**
 * pickComponentHelper will generate an asynchronous pickComponent function, given a map of pageType to component definitions,
 * and a map of functions to load each chunk.
 *
 * This was earlier exposed via *"@quintype/framework/server/pick-component-helper"*, which is considered deprecated.
 *
 * ```javascript
 * const { pickComponent, getChunkName } = pickComponentHelper(
 *   {
 *     [PAGE_TYPE.HOME_PAGE]: { chunk: "list", component: "HomePage" },
 *     [PAGE_TYPE.SECTION_PAGE]: { chunk: "list", component: "SectionPage" },
 *     [PAGE_TYPE.STORY_PAGE]: { chunk: "story", component: "StoryPage" },
 *     default: { chunk: "list", component: "NotFoundPage" }
 *   },
 *   {
 *     list: () => import(&#47;* webpackChunkName: "list" *&#47; "./component-bundles/list.js"),
 *     story: () => import(&#47;* webpackChunkName: "story" *&#47; "./component-bundles/story.js")
 *   }
 * );
 * ```
 * @param {Object} components A map from *pageType* to *{chunk, component}*
 * @param {Object} loadChunk A map from *chunkName* to function that returns a promise that resolves to the chunk
 * @returns {Object} A pair of functions: *pickComponent(pageType)* and *getChunkName(pageType)*.
 */
exports.pickComponentHelper = function pickComponentHelper(
  components,
  loadChunk
) {
  return {
    pickComponent,
    getChunkName
  };

  function pickComponent(pageType) {
    const { chunk, component } = components[pageType] || components.default;
    return loadChunk[chunk]().then(chunk => chunk[component]);
  }

  function getChunkName(pageType) {
    const { chunk } = components[pageType] || components.default;
    return chunk;
  }
};
