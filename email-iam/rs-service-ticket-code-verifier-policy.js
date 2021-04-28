var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();
var contextAttributes = context.attributes;

var codeVerifier = identityAttributes.getValue('code-verifier').asString(0);
var codeChallenge = contextAttributes.getValue('code-challenge').asString(0);

// print(codeVerifier);
// print(codeChallenge);

var MessageDigest = Java.type('java.security.MessageDigest');
var JavaString = Java.type('java.lang.String');
var Base64Url = Java.type('org.keycloak.common.util.Base64Url');

var codeVerifierString = new JavaString(codeVerifier);
var md = MessageDigest.getInstance("SHA-256");
var codeVerifierHash = Base64Url.encode(md.digest(codeVerifierString.getBytes('UTF-8')));

if (codeChallenge.localeCompare(codeVerifierHash) === 0) {
  $evaluation.grant();    
} else {
  print('evaluation denied after code verification');    
  $evaluation.deny();
}
