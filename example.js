"use strict";

const KeycloakAdminClient = require("./lib/KeycloakAdminClient");

const settings = {
  baseUrl: "http://127.0.0.1:8080/auth",
  username: "keycloak",
  password: "keycloak",
  grant_type: "password",
  client_id: "admin-cli"
};

const keycloakAdmin = new KeycloakAdminClient(settings);

keycloakAdmin.getToken$().subscribe(client => {
  console.log('Client ==> ', client);
});

// keycloakAdmin.getKeycloakAdminClient().then((client) => {
//   // Use the master realm
//   const realmName = 'DEV_TPI';
//   console.log('client.users => ', client[0].users);
//   return client[0].users.checkTokenValidity(realmName).then((data) => {
//     console.log('checkTokenValidity => ', data);
//   },
//   error => {
//     console.log('Error => ', error);
//   });
// });
