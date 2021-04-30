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

var verifyToken = function verifyToken(claimsToken) {
    var verifier = TokenVerifier.create(claimsToken, IDToken.class);
    var kid = verifier.getHeader().getKeyId();
    var algorithm = verifier.getHeader().getAlgorithm().name();
    var iss = verifier.getToken().getIssuer();
    // print('iss: '  + iss);
    var response = httpGet(iss).data;
    // print('response: ' + response);
    var jsonWebKeySet = JsonSerialization.readValue(response, JSONWebKeySet.class);
    var jws = new JWSInput(claimsToken);
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
var jwtTickets = httpRequest.getDecodedFormParameters().get("ticket");
var claimToken = httpRequest.getDecodedFormParameters().getFirst("claim_token");
var claimTokens = httpRequest.getDecodedFormParameters().get("claim_token");

// print('ClaimToken: ' + claimToken);

var parseJwtToken = function parseJwtToken(token) {
    var base64Url = token.split('.')[1];
    var base64Str = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = Base64.getDecoder().decode(base64Str);
    return JSON.parse(new JavaString(decoded));
}

var parseClaimToken = function parseClaimToken(token) {
    var base64Str = token.replace(/-/g, '+').replace(/_/g, '/');
    var decoded = Base64.getDecoder().decode(token);
    return JSON.parse(new JavaString(decoded));
}

if ((jwtTickets && jwtTickets.size() === 1) && (claimTokens && claimTokens.size() === 1)) {
    // var removedString = httpRequest.getDecodedFormParameters().remove("claim_token");
    // print('removedString: ' + removedString);

    var ticket = parseJwtToken(jwtTicket);
    var codeVerifier = String(ticket.claims['code_verifier']);
    // print('codeVerifier: '  + codeVerifier);
    token.setOtherClaims("code_verifier", codeVerifier);

    var claimTokenParsed = parseClaimToken(claimToken);
    // print('ClaimTokenParsed: ' + claimTokenParsed);
    var claimsToken = String(claimTokenParsed['claims_token']);
    // print('ClaimsToken: ' + claimsToken);
    var claims = verifyToken(claimsToken);
    if (claims) {
        print('code_challenge: ' + claims.get('code_challenge'));
        print('email_address: ' + claims.get('email_address'));
        token.setOtherClaims("code_challenge", claims.get('code_challenge'));
        token.setOtherClaims("email_address", claims.get('email_address'));
    }
}