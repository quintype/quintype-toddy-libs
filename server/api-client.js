// istanbul ignore file

const config = require("./publisher-config");
const {getClientImpl, Client, Story, Author, CustomPath, Member, Collection, Entity, MenuGroups, Config} = require("./impl/api-client-impl");

const defaultClient = new Client(config.sketches_host);
const cachedSecondaryClients = {};

function getClient(hostname) {
  return getClientImpl(config, cachedSecondaryClients, hostname) || defaultClient;
}

function initializeAllClients() {
  const promises = [defaultClient.getConfig()];
  if(!config.skip_warm_config)  {
    Object.entries(config.host_to_api_host || []).forEach(([host, apiHost]) => {
      const client = new Client(apiHost);
      cachedSecondaryClients[host] = client;
      promises.push(client.getConfig());
    });
  }
  return Promise.all(promises);
}

module.exports = {
  Story: Story,
  Author: Author,
  CustomPath: CustomPath,
  Collection: Collection,
  Member: Member,
  Entity: Entity,
  MenuGroups: MenuGroups,
  Config: Config,

  client: defaultClient,
  getClient: getClient,
  initializeAllClients: initializeAllClients
};
