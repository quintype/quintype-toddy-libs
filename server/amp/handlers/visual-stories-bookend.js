const get = require("lodash/get");

function getImageUrl(story, config) {
  if (get(story, ["story-template"]) === "news-elsewhere") {
    return get(story, ["metadata", "reference-url"], "");
  }
  return `${config["sketches-host"]}/${story.slug}`;
}

async function bookendHandler(req, res, next, { config, client }) {
  const relatedStoriesResponse = await client.getRelatedStories(
    req.query.storyId,
    req.query.sectionId
  );
  const relatedStories = relatedStoriesResponse["related-stories"];
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
        url: getImageUrl(story, config),
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

  if (relatedStories.length > 0) {
    res.header(
      "Cache-Control",
      "public,max-age=15,s-maxage=900,stale-while-revalidate=1000,stale-if-error=14400"
    );
    res.header("Vary", "Accept-Encoding");
    res.json(jsonPayLoad);
  } else {
    res.status(404);
    res.json({ error: { message: "Not Found" } });
  }
}

module.exports = { bookendHandler };
