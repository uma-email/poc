var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var issuer = identityAttributes.getValue('issuer');
var jwksUri = identityAttributes.getValue('jwks_uri');

var localUriStr = 'http://acme:3000/claims/jwks';

if (issuer && jwksUri) {
  var issuerStr = issuer.asString(0);
  var jwksUriStr = jwksUri.asString(0);

  if (issuerStr.localeCompare(jwksUriStr) === 0) {
    print('evaluation granted (remote issuer verified)');
    $evaluation.grant();
  } else {
    print('evaluation denied (remote issuer mishmash)');
    $evaluation.deny();
  }
} else if (issuer) {
  var issuerStr = issuer.asString(0);

  if (issuerStr.localeCompare(localUriStr) === 0) {
    print('evaluation granted (local issuer verified)');
    $evaluation.grant();
  } else {
    print('evaluation denied (local issuer mishmash)');
    $evaluation.deny();
  }
} else {
  print('evaluation denied (cannot verify issuer)');
  $evaluation.deny();
}
