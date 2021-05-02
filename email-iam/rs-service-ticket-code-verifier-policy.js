var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var ticketVerifier = identityAttributes.getValue('ticket_verifier');
var ticketChallenge = identityAttributes.getValue('ticket_challenge');

if (ticketVerifier && ticketChallenge) {
    var ticketVerifierStr = ticketVerifier.asString(0);
    var ticketChallengeStr = ticketChallenge.asString(0);

    // print('ticketVerifierStr: ' + ticketVerifierStr);
    // print('ticketChallengeStr: ' + ticketChallengeStr);

    var MessageDigest = Java.type('java.security.MessageDigest');
    var JavaString = Java.type('java.lang.String');
    var Base64Url = Java.type('org.keycloak.common.util.Base64Url');

    var ticketVerifierString = new JavaString(ticketVerifierStr);
    var md = MessageDigest.getInstance("SHA-256");
    var ticketVerifierHash = Base64Url.encode(md.digest(ticketVerifierString.getBytes('UTF-8')));

    if (ticketChallengeStr.localeCompare(ticketVerifierHash) === 0) {
      print('evaluation granted (ticket verified)');
      $evaluation.grant();
    } else {
      print('evaluation denied (ticket mishmash)');
      $evaluation.deny();
    }
} else {
    print('evaluation denied (cannot verify ticket)');
    $evaluation.deny();
}
