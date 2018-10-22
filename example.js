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

keycloakAdmin.start$().subscribe(client => {
  //console.log('Client ==> ', client);

  keycloakAdmin.startTokenRefresher$().subscribe(res => {
    console.log('Res => ', res);
  },
error => {
  console.log('Error => ', error)
});
});


