'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module clients
 */

module.exports = {
  find: find,
  create: create
};

/**
  A function to get the all the roles of a client or a specific role for a client
  @param {string} realmName - The name of the realm (not the realmID) where the client roles exist - ex: master
  @param {string} id - The id of the client (not the client-id) whose roles should be found
  @param {string} roleName - Optional name of a specific client role to find
  @returns {Promise} A promise that will resolve with the Array of roles or just one role if the roleName option is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.roles.find(realmName, id)
        .then((clientRoles) => {
          console.log(clientRoles)
      })
    })
 */
function find (client) {
  return function find (realmName, id, roleName) {
    return new Promise((resolve, reject) => {
      const req = {
        auth: {
          bearer: privates.get(client).token.access_token
        },
        json: true
      };

      if (roleName) {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients/${id}/roles/${roleName}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realmName}/clients/${id}/roles`;
      }

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          const httpError = {
            statusCode: resp.statusCode,
            statusMessage: resp.statusMessage,
            body: body
          };
          return reject(httpError);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to create a new role.
  @param {string} realmName - The name of the realm (not the realmID) where the client roles exist - ex: master
  @param {string} id - The id of the client (not the client-id) whose roles should be found
  @param {object} newRole - The JSON representation of a role - http://www.keycloak.org/docs-api/3.0/rest-api/index.html#_rolerepresentation - name must be unique within the client
  @returns {Promise} A promise that will resolve with the newly created client role
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.clients.roles.create(realmName, id, newRole)
        .then((createRole) => {
        console.log(createRole) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, id, newRole) {
    return new Promise((resolve, reject) => {
      if (!newRole) {
        return reject(new Error('role is missing'));
      }

      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/clients/${id}/roles`,
        auth: {
          bearer: privates.get(client).token.access_token
        },
        body: newRole,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          const httpError = {
            statusCode: resp.statusCode,
            statusMessage: resp.statusMessage,
            body: body
          };
          return reject(httpError);
        }

        // Since the create Endpoint returns an empty body, go get what we just imported.
        return resolve(client.clients.roles.find(realm, id, newRole.name));
      });
    });
  };
}
