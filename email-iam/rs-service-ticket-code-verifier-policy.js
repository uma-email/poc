var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var ticket = identityAttributes.getValue('ticket');
var ticketDigest = identityAttributes.getValue('ticket_digest');
var oauthEcosystem = identityAttributes.getValue('oauth_ecosystem');

// not real iana registry
var ecosystemType = "urn:ietf:params:oauth:ecosystem:uma-wide:aems";

if (ticket && ticketDigest && oauthEcosystem) {
  var ticketStr = ticket.asString(0);
  var ticketDigestStr = ticketDigest.asString(0);
  var oauthEcosystemStr = oauthEcosystem.asString(0);

  // print('ticketStr: ' + ticketStr);
  // print('ticketDigestStr: ' + ticketDigestStr);
  // print('oauthEcosystemStr: ' + oauthEcosystemStr);

  var MessageDigest = Java.type('java.security.MessageDigest');
  var JavaString = Java.type('java.lang.String');
  var Base64Url = Java.type('org.keycloak.common.util.Base64Url');

  var ticketString = new JavaString(ticketStr);
  var md = MessageDigest.getInstance("SHA-256");
  var ticketHash = Base64Url.encode(md.digest(ticketString.getBytes('UTF-8')));

  if (oauthEcosystem.localeCompare(ecosystemType) === 0) {
    if (ticketDigestStr.localeCompare(ticketHash) === 0) {
      print('evaluation granted (ticket verified)');
      $evaluation.grant();
    } else {
      print('evaluation denied (ticket mishmash)');
      $evaluation.deny();
    }
  } else {
    print('evaluation denied (not uma-wide:aems ecosystem, cannot verify ticket)');
    $evaluation.deny();
  }

} else {
  print('evaluation denied (cannot verify ticket)');
  $evaluation.deny();
}
