"use strict";

const {getKeycloakToken, refreshKeycloakToken} = require('./auth');
const bindModule = require('../tools/bind-module');
const privates = require('./private-map');
const realms = require('./realms');
const users = require('./users');
const clients = require('./clients');
const groups = require('./groups');
const events = require('./events');

/////////// RXJS /////////////
const Rx = require('rxjs');
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
  constructor(settings) {
    this.settings = settings;
  }

  getKeycloakAdminClient(){
    this.settings = this.settings || {};

    // setup our client and its private data
    this.data = {};
    this.client = {};

    // Recursively bind the modules to the client
    Object.assign(
      this.client,
      bindModule(this.client, {
        realms: realms,
        users: users,
        clients: clients,
        groups: groups,
        events: events
      })
    );

    // Make baseUrl unchanging
    Object.defineProperty(this.client, "baseUrl", {
      value: this.settings.baseUrl
    });

    // A WeakMap reference to our private data
    // means that when all references to 'client' disappear
    // then the entry will be removed from the map
    privates.set(this.client, this.data);

    // return a promise that resolves after auth
    return getKeycloakToken(this.client, this.settings);
  }

  start$() {
    return Rx.Observable.defer(()=> {
      return this.getKeycloakAdminClient();
    });
  }

  /**
 * Monitors the expiration time of the token.
 * When the access token is about to expire, this monitor uses the refresh token to get a new access token
 */
  startTokenRefresher$(){
    return Rx.Observable.interval(2000)
    .mergeMap(client => {
      //privates.get(client);
      //console.log('this.data.refresh_token ==> ', this.data.token.refresh_token);

      return Rx.Observable.defer(() => refreshKeycloakToken(this.client, {
        refresh_token: this.data.token.refresh_token,
        grant_type: 'refresh_token',
        client_id: 'admin-cli',
        //realmName: 'master'
      }));
    });
  }
}

module.exports = KeycloakAdminClient;
