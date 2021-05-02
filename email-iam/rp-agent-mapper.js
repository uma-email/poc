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
 var TokenVerifier = Java.type('org.keycloak.TokenVerifier');
 var VerifierContext = Java.type('org.keycloak.crypto.AsymmetricSignatureVerifierContext');
 var Base64 = Java.type('java.util.Base64');
 var JSONWebKeySet = Java.type('org.keycloak.jose.jwk.JSONWebKeySet');
 var JsonSerialization = Java.type('org.keycloak.util.JsonSerialization');
 var JWSInput = Java.type('org.keycloak.jose.jws.JWSInput');
 var PublicKey = Java.type('java.security.PublicKey');
 var JWKParser = Java.type('org.keycloak.jose.jwk.JWKParser');
 var RSAProvider = Java.type('org.keycloak.jose.jws.crypto.RSAProvider');
 
 var IDToken = Java.type('org.keycloak.representations.IDToken');
 var JavaString = Java.type('java.lang.String');
 
 function httpGet(theUrl) {
     var con = new java.net.URL(theUrl).openConnection();
     con.requestMethod = "GET";
     return asResponse(con);
 }
 
 function asResponse(con) {
     var d = read(con.inputStream);
     return { data: d, statusCode: con.responseCode };
 }
 
 function read(inputStream) {
     var inReader = new java.io.BufferedReader(new java.io.InputStreamReader(inputStream));
     var inputLine;
     var response = new java.lang.StringBuffer();
 
     while ((inputLine = inReader.readLine()) !== null) {
         response.append(inputLine);
     }
     inReader.close();
     return response.toString();
 }
 
 var verifyToken = function verifyToken(token) {
     var verifier = TokenVerifier.create(token, IDToken.class);
     var jsonWebToken = verifier.getToken();
     if (!jsonWebToken.isActive()) {
         return false;
     }
     var kid = verifier.getHeader().getKeyId();
     var algorithm = verifier.getHeader().getAlgorithm().name();
     var iss = verifier.getToken().getIssuer();
     // print('iss: '  + iss);
     try {
        var response = httpGet(iss).data;
     } catch(e) {
         return false;
     }
     // print('response: ' + response);
     var jsonWebKeySet = JsonSerialization.readValue(response, JSONWebKeySet.class);
     var jws = new JWSInput(token);
     var k = jsonWebKeySet.getKeys();
     var publicKey = JWKParser.create(k[0]).toPublicKey()
     var okay = RSAProvider.verify(jws, publicKey);
     if (okay) {
         return verifier.getToken().getOtherClaims();
     } else {
         return false;
     }
 }
 
 var httpRequest = keycloakSession.getContext().getContextObject(HttpRequest.class);
 // print('httpRequest: ' + httpRequest.getDecodedFormParameters());
 var jwtTicket = httpRequest.getDecodedFormParameters().getFirst("ticket");
 var pushedClaims = httpRequest.getDecodedFormParameters().getFirst("claim_token"); // claim_token in Keycloak should be named as a pushed_claims
 
 var parseClaims = function parseClaims(claims) {
    var base64Str = claims.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = Base64.getDecoder().decode(claims);
    return JSON.parse(new JavaString(decoded));
}

var parseJwtToken = function parseJwtToken(token) {
     var claims = token.split('.')[1];
     return parseClaims(claims);
 }
 
 if (jwtTicket && pushedClaims) {
     var ticket = parseJwtToken(jwtTicket);
     var ticketVerifier = String(ticket.claims['ticket_verifier']);
     // print('TicketVerifier: '  + ticketVerifier);
     token.setOtherClaims("ticket_verifier", ticketVerifier);
 
     var pushedClaimsObj = parseClaims(pushedClaims);
     var claimsToken = String(pushedClaimsObj['claims_token']);
     // print('ClaimsToken: ' + claimsToken);
     var claims = verifyToken(claimsToken);
     if (claims) {
         print('ticket_challenge: ' + claims.get('ticket_challenge'));
         print('email_address: ' + claims.get('email_address'));
         token.setOtherClaims("ticket_challenge", claims.get('ticket_challenge'));
         token.setOtherClaims("email_address", claims.get('email_address'));
     }
 }