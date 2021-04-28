/**
 * Available variables: 
 * user - the current user
 * realm - the current realm
 * token - the current token
 * userSession - the current userSession
 * keycloakSession - the current keycloakSession
 */

 var HttpRequest = Java.type('org.jboss.resteasy.spi.HttpRequest');
 var JsonWebToken = Java.type('org.keycloak.representations.JsonWebToken');
 var JsonSerialization = Java.type('org.keycloak.util.JsonSerialization');
 
 var httpRequest = keycloakSession.getContext().getContextObject(HttpRequest.class);
 var jwtTicket = httpRequest.getDecodedFormParameters().getFirst("ticket");
 var jwtTickets = httpRequest.getDecodedFormParameters().get("ticket");
 
 var parseJwtToken = function parseJwtToken(token) {
     var base64Url = token.split('.')[1];
     var base64Str = base64Url.replace(/-/g, '+').replace(/_/g, '/');
     var Base64 = Java.type('java.util.Base64');
     var decoded = Base64.getDecoder().decode(base64Str);
     var JavaString = Java.type('java.lang.String');
     return JSON.parse(new JavaString(decoded));
 }
 
 if (jwtTickets.size() === 1) {
     var ticket = parseJwtToken(jwtTicket);
     var codeVerifier = String(ticket.claims['code-verifier']);
     // print(codeVerifier);
     token.setOtherClaims("code-verifier", codeVerifier);
 }