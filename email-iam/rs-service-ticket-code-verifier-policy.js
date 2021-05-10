var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var ticket = identityAttributes.getValue('ticket');
var ticketChallenge = identityAttributes.getValue('ticket_challenge');

if (ticket && ticketChallenge) {
    var ticketStr = ticket.asString(0);
    var ticketChallengeStr = ticketChallenge.asString(0);

    // print('ticketStr: ' + ticketStr);
    // print('ticketChallengeStr: ' + ticketChallengeStr);

    var MessageDigest = Java.type('java.security.MessageDigest');
    var JavaString = Java.type('java.lang.String');
    var Base64Url = Java.type('org.keycloak.common.util.Base64Url');

    var ticketString = new JavaString(ticketStr);
    var md = MessageDigest.getInstance("SHA-256");
    var ticketHash = Base64Url.encode(md.digest(ticketString.getBytes('UTF-8')));

    if (ticketChallengeStr.localeCompare(ticketHash) === 0) {
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
