var context = $evaluation.context;
var contextAttributes = context.attributes;
var resource = $evaluation.getPermission().getResource();
var resourceAttributes = resource.getAttributes();
var contextTac = contextAttributes.getValue('tac').asString(0);
var resourceTac = resourceAttributes.tac[0];
var contextClient = contextAttributes.getValue('kc.client.id').asString(0);
var resourceClient = resourceAttributes.client_id[0];

print('contextAttributes=' + contextAttributes);
print('resourceAttributes=' + resourceAttributes);
print('contextClient=' + contextClient);
print('resourceClient=' + resourceClient);
print('contextTac=' + contextTac);
print('resourceTac=' + resourceTac);

if ((contextClient == resourceClient) && (contextTac === resourceTac)) {
    $evaluation.grant();
} else {
    $evaluation.deny();
}