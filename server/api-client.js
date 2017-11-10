const backend = require("quintype-backend");
const Client = backend.Client;
const config = require("./publisher-config");

const defaultClient = new Client(config.sketches_host);
const cachedSecondaryClients = {};

function getClient(hostname) {
  return cachedSecondaryClients[hostname] || createTemporaryClient(hostname) || defaultClient;
}

function createTemporaryClient(hostname) {
  const matchedString = (config.host_to_automatic_api_host || []).some(str => hostname.includes(str) && str);
  if(matchedString)
    return new Client(`https://${hostname.replace(matchedString, "")}`, true);
}

function initializeAllClients() {
  const promises = [defaultClient.getConfig()];
  Object.entries(config.host_to_api_host || []).forEach(([host, apiHost]) => {
    const client = new Client(apiHost);
    cachedSecondaryClients[host] = client;
    promises.push(client.getConfig());
  });
  return Promise.all(promises);
}

defaultClient.client = defaultClient;
defaultClient.Story = backend.Story;
defaultClient.getClient = getClient;
defaultClient.initializeAllClients = initializeAllClients;
module.exports = defaultClient;
