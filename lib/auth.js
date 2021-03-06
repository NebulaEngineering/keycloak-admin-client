'use strict';

const privates = require('./private-map');
// const { getToken, refreshToken } = require('keycloak-request-token');
const { getToken, refreshToken } = require('./KeycloakRequestToken');

function getKeycloakToken (client, settings) {
  if (settings.accessToken) {
    return Promise.resolve(settings.accessToken);
  }
  return getToken(client.baseUrl, settings)
    .then((token) => {
      privates.get(client).token = token;
      return [client, token];
    });
}

function refreshKeycloakToken (client, settings) {
  return refreshToken(client.baseUrl, settings)
    .then((token) => {
      privates.get(client).token = token;
      return [client, token];
    });
}

// function authenticate (client, settings) {
//   return getToken(client.baseUrl, settings)
//     .then((token) => {
//       privates.get(client).accessToken = token;
//       return client;
//     });
// }

module.exports = { getKeycloakToken, refreshKeycloakToken };
