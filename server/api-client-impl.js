function getClientImpl(config, cachedSecondaryClients, Client, hostname) {
  return cachedSecondaryClients[hostname] || createTemporaryClient(config, Client, hostname);
}

function createTemporaryClient(config, Client, hostname) {
  const matchedString = (config.host_to_automatic_api_host || []).find(str => hostname.includes(str));
  if(matchedString)
    return new Client(`https://${hostname.replace(matchedString, "")}`, false);
}

module.exports = {getClientImpl};
