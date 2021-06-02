const { ampStoryPageHandler } = require("./story-page");
const { storyPageInfiniteScrollHandler } = require("./infinite-scroll");
const { bookendHandler } = require("./visual-stories-bookend");
const {
  webengageHelperIframeHandler,
  webengagePermissionDialogHandler,
  webengageServiceWorkerHandler,
} = require("./webengage");

module.exports = {
  ampStoryPageHandler,
  storyPageInfiniteScrollHandler,
  bookendHandler,
  webengageHelperIframeHandler,
  webengagePermissionDialogHandler,
  webengageServiceWorkerHandler,
};
