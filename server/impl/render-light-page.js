const httpProxy = require("http-proxy");

const renderLightPage = (req, res, client) => {
  //Ramsharan: Check if this can be moved to build time initialisation
  const proxy = httpProxy.createProxyServer();
  proxy.on("proxyReq", proxyReq => {
    proxyReq.setHeader("Host", client.getHostname());
  });
  proxy.web(req, res, {
    target: `${client.baseUrl}/amp/story/${encodeURIComponent(req.path)}`,
    ssl: client.baseUrl.startsWith("https")
      ? { servername: client.getHostname() }
      : undefined,
    ignorePath: true
  });
};

module.exports = renderLightPage;
