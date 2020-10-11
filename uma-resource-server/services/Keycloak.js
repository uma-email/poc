const KeycloakAuth = require('keycloak-connect')
const session = require('express-session')

const memoryStore = new session.MemoryStore()

const KC_AUTH_SERVER_URL = process.env.KC_AUTH_SERVER_URL
const KC_REALM = process.env.KC_REALM || 'localhost'
const KC_CLIENT_ID = process.env.KC_CLIENT_ID

const keycloak = new KeycloakAuth(
  { store: memoryStore },
  {
    bearerOnly: true,
    clientId: KC_CLIENT_ID,
    authServerUrl: KC_AUTH_SERVER_URL,
    realm: KC_REALM
  }
)

module.exports = {
  keycloak,
  store: memoryStore
}
