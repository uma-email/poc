var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var codeVerifier = identityAttributes.getValue('code_verifier');
var codeChallenge = identityAttributes.getValue('code_challenge');

if (codeVerifier && codeChallenge) {
    var codeVerifierStr = codeVerifier.asString(0);
    var codeChallengeStr = codeChallenge.asString(0);

    // print('codeVerifierStr: ' + codeVerifierStr);
    // print('codeChallengeStr: ' + codeChallengeStr);

    var MessageDigest = Java.type('java.security.MessageDigest');
    var JavaString = Java.type('java.lang.String');
    var Base64Url = Java.type('org.keycloak.common.util.Base64Url');
    
    var codeVerifierString = new JavaString(codeVerifierStr);
    var md = MessageDigest.getInstance("SHA-256");
    var codeVerifierHash = Base64Url.encode(md.digest(codeVerifierString.getBytes('UTF-8')));
    
    if (codeChallengeStr.localeCompare(codeVerifierHash) === 0) {
      $evaluation.grant();
    } else {
      print('evaluation denied after code verification');    
      $evaluation.deny();
    }
    
} else {
    $evaluation.deny();
}
