const httpProxy = require("http-proxy");

const webStoriesHandler = (req, res, next, { client, config, domainSlug }) => {
  const proxy = httpProxy.createProxyServer();
  proxy.on("proxyReq", (proxyReq) => {
    proxyReq.setHeader("Host", client.getHostname());
  });
  proxy.web(req, res, {
    target: `${client.baseUrl}/amp/story/${req.path}`,
    ssl: client.baseUrl.startsWith("https")
      ? { servername: client.getHostname() }
      : undefined,
    ignorePath: true,
  });
};

module.exports = { webStoriesHandler };
