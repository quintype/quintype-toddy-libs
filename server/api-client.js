const backend = require("quintype-backend");
const Client = backend.Client;
const config = require("./publisher-config");

// default client
const client = new Client(config.sketches_host);
const cachedSecondaryClients = {};

function getClient(hostname) {
  return cachedSecondaryClients[hostname] || client;
}

function initializeAllClients() {
  const promises = [client.getConfig()];
  Object.entries(config.host_to_api_host || []).forEach(([host, apiHost]) => {
    const client = new Client(apiHost);
    cachedSecondaryClients[host] = client;
    promises.push(client.getConfig());
  });
  return Promise.all(promises);
}

client.client = client;
client.Story = backend.Story;
client.getClient = getClient;
client.initializeAllClients = initializeAllClients;
module.exports = client;
