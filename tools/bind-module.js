'use strict';

function bindModule (client, input) {
  if (typeof input === 'object') {
    const initializedModule = {};
    // https://github.com/bucharest-gold/keycloak-admin-client/issues/40
    // eslint-disable-next-line prefer-const
    for (let name in input) {
      initializedModule[name] = bindModule(client, input[name]);
    }
    return initializedModule;
  } else if (typeof input === 'function') {
    return input(client);
  } else {
    throw new Error(`Unexpected input module type: ${input}`);
  }
}

module.exports = bindModule;
