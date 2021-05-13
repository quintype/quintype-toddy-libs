const get = require("lodash/get");
const { handleSpanInstance } = require("../../utils/apm");

function getStoryUrl(story, config) {
  if (get(story, ["story-template"]) === "news-elsewhere") {
    return get(story, ["metadata", "reference-url"], "");
  }
  return `${config["sketches-host"]}/${story.slug}`;
}

async function bookendHandler(req, res, next, { config, client }) {
  const apmInstance = handleSpanInstance({ isStart: true, title: "bookendHandler" });
  const { storyId, sectionId } = req.query;
  if (!storyId || !sectionId) {
    res.status(400).json({
      error: {
        message: "Please provide 'storyId' and 'sectionId' query parameters",
      },
    });
    return;
  }

  const relatedStoriesResponse = await client.getRelatedStories(
    storyId,
    sectionId
  );
  const relatedStories = relatedStoriesResponse["related-stories"];

  if (!relatedStories.length) {
    res.status(404).json({ error: { message: "Not Found" } });
    return;
  }

  const fbAppId = get(
    config,
    ["public-integrations", "facebook", "app-id"],
    ""
  );

  const jsonPayLoad = {
    bookendVersion: "v1.0",
    shareProviders: [
      "twitter",
      "email",
      {
        provider: "facebook",
        app_id: fbAppId,
      },
      "whatsapp",
      "linkedin",
      "gplus",
    ],
    components: [].concat(
      [
        {
          type: "heading",
          text: "More to read",
        },
      ],
      relatedStories.map((story) => ({
        type: "small",
        title: `${story.headline}`,
        image: `${config["cdn-name"]}${story["hero-image-s3-key"]}?w=480&auto=format&compress`,
        url: getStoryUrl(story, config),
      })),
      [
        {
          type: "cta-link",
          links: [
            {
              text: "More stories",
              url: `${config["sketches-host"]}`,
            },
          ],
        },
      ]
    ),
  };

  res.header(
    "Cache-Control",
    "public,max-age=15,s-maxage=900,stale-while-revalidate=1000,stale-if-error=14400"
  );
  res.header("Vary", "Accept-Encoding");
  handleSpanInstance({ apmInstance });
  res.json(jsonPayLoad);
}

module.exports = { bookendHandler };
