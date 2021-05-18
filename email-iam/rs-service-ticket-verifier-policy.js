var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var ticket = identityAttributes.getValue('ticket');
var ticketDigest = identityAttributes.getValue('ticket_digest');
var ecosystemType = identityAttributes.getValue('ecosystem_type');

// not real iana registry
var ecosystemTypeUrn = "urn:ietf:params:oauth:ecosystem:uma-wide:aems";

if (ticket && ticketDigest && ecosystemType) {
  var ticketStr = ticket.asString(0);
  var ticketDigestStr = ticketDigest.asString(0);
  var ecosystemTypeStr = ecosystemType.asString(0);

  // print('ticketStr: ' + ticketStr);
  // print('ticketDigestStr: ' + ticketDigestStr);
  // print('ecosystemTypeStr: ' + ecosystemTypeStr);

  var MessageDigest = Java.type('java.security.MessageDigest');
  var JavaString = Java.type('java.lang.String');
  var Base64Url = Java.type('org.keycloak.common.util.Base64Url');

  var ticketString = new JavaString(ticketStr);
  var md = MessageDigest.getInstance("SHA-256");
  var ticketHash = Base64Url.encode(md.digest(ticketString.getBytes('UTF-8')));

  if (ecosystemTypeStr.localeCompare(ecosystemTypeUrn) === 0) {
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
