const renderLightPage = (req, res, result) => {
  const host = result.sketches_host;
  const apiProxy = require("http-proxy").createProxyServer({
    target: host,
    ssl: host.startsWith("https")
      ? { servername: host.replace(/^https:\/\//, "") }
      : undefined
  });

  apiProxy.on("proxyReq", (proxyReq, req, res, options) => {
    proxyReq.setHeader("Host", `${getClient(req.hostname).getHostname()}`);
  });

  const sketchesProxy = (req, res) => apiProxy.web(req, res);
  sketchesProxy(req, res);
};

export default renderLightPage;
