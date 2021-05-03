var context = $evaluation.context;
var identity = context.getIdentity();

var identityAttributes = identity.getAttributes();

var issuer = identityAttributes.getValue('issuer');
var jwksUri = identityAttributes.getValue('jwks_uri');

if (issuer && jwksUri) {
    var issuerStr = issuer.asString(0);
    var jwksUriStr = jwksUri.asString(0);

    // print('issuerStr: ' + issuerStr);
    // print('jwksUriStr: ' + jwksUriStr);

    if (issuerStr.localeCompare(jwksUriStr) === 0) {
      print('evaluation granted (issuer verified)');
      $evaluation.grant();
    } else {
      print('evaluation denied (issuer mishmash)');
      $evaluation.deny();
    }
} else {
    print('evaluation denied (cannot verify issuer)');
    $evaluation.deny();
}
