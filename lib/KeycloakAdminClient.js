"use strict";

const {getKeycloakToken, refreshKeycloakToken} = require('./auth');
// const bindModule = require('../tools/bind-module');
const privates = require('./private-map');
const realms = require('./realms');
const users = require('./users');
const clients = require('./clients');
const groups = require('./groups');
const events = require('./events');
const token = require('./token');

/////////// RXJS /////////////
const { defer } = require('rxjs');
// const {
//   take,
//   elay,
//   delayWhen,
//   catchError,
//   retryWhen,
//   mergeMap
// } = require("rxjs/operators");

class KeycloakAdminClient {
  /**
   * Create a new Keycloak admin client
   * @param {*} settings
   */
  constructor (settings) {
    this.settings = settings;
  }

  bindModule (client, input) {
    // For an
    if (typeof input === 'object') {
      const initializedModule = {};
      // https://github.com/bucharest-gold/keycloak-admin-client/issues/40
      // eslint-disable-next-line prefer-const
      for (let name in input) {
        initializedModule[name] = this.bindModule(client, input[name]);
      }
      return initializedModule;
    } else if (typeof input === 'function') {
      return input(client);
    } else {
      throw new Error(`Unexpected input module type: ${input}`);
    }
  }

  getKeycloakAdminClient () {
    this.settings = this.settings || {};

    // setup our client and its private data
    this.data = {};
    this.client = {};

    // Recursively bind the modules to the client
    Object.assign(
      this.client,
      this.bindModule(this.client, {
        realms: realms,
        users: users,
        clients: clients,
        groups: groups,
        events: events,
        token: token
      })
    );

    // Make baseUrl unchanging
    Object.defineProperty(this.client, 'baseUrl', {
      value: this.settings.baseUrl
    });

    // A WeakMap reference to our private data
    // means that when all references to 'client' disappear
    // then the entry will be removed from the map
    privates.set(this.client, this.data);

    // return a promise that resolves after auth
    return getKeycloakToken(this.client, this.settings);
  }

  /**
   * get keycloak token
   */
  getToken$ () {
    return defer(() => {
      return this.getKeycloakAdminClient();
    });
  }

  /**
   * refresh keycloak token
   */
  refreshToken$ () {
    return defer(() => refreshKeycloakToken(this.client, {
      refresh_token: this.data.token.refresh_token,
      grant_type: 'refresh_token',
      client_id: this.settings.client_id,
      realmName: this.settings.realmName
    }));
  }
}

module.exports = KeycloakAdminClient;
