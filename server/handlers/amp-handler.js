const { ampifyStory } = require("@quintype/amp");
const { Story, AmpConfig } = require("../api-client");

exports.handleAmpRequest = async function handleAmpRequest(
  req,
  res,
  next,
  { client, config, ampOpts }
) {
  try {
    // eslint-disable-next-line no-return-await
    const ampConfig = await config.memoizeAsync(
      "amp-config",
      async () => await AmpConfig.getAmpConfig(client)
    );
    const story = await Story.getStoryBySlug(client, req.params.slug);

    if (!story) {
      return next();
    }
    const ampHtml = ampifyStory({
      story,
      publisherConfig: config,
      ampConfig,
      client,
      opts: ampOpts
    });
    if (ampHtml instanceof Error) return next(ampHtml);
    return res.send(ampHtml);
  } catch (e) {
    return next(e);
  }
};
