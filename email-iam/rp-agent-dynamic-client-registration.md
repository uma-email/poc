POST url
```
http://localhost:8180/auth/realms/dev/clients-registrations/default
```
request body
```
{
      "bearerOnly": false,
      "consentRequired": false,
      "standardFlowEnabled": false,
      "implicitFlowEnabled": false,
      "directAccessGrantsEnabled": false,
      "serviceAccountsEnabled": true,
      "authorizationServicesEnabled": true,
      "publicClient": false
}
```