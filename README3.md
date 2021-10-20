# Channel-Bound Tokens

### Terminology

* Confidential Registration Identifier (CRI): A nonce that is generated at the AS-RO and returned to the registering party during the registration process. The CRI is not publicly available, it is only known to the AS-RO and the relevant registering party.
* Confidential Client: A client that has a shared secret and a shared CRI with the AS-RO.
* Confidential RS: A resource server that has a shared secret and a shared CRI with the AS-RO.

### Concept

The channel is defined by the client CRI (start) and RS CRI (target).

### Use Cases

A proof of possession tokens and a verifiable target audience.

### Prerequisites

* The client is registered at the AS-RO as a Confidential Client.
* The RS is registered at the AS-RO as a Confidential RS.

### Steps (basic variant)

1. The RqP directs the client to access the 'RS API' resource with no access token.
2. Without an access token, the RS will return HTTP code 401 (Unauthorized) with a permission ticket which has to be a nonce.
3. The client generates a ticket hash derived from the permission ticket using the following transformation ticket_hash = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the client requests a claims token by presenting the access token with user claims and the generated ticket hash.
5. The AS-RqP returns the claims token.
6. The client requests an RPT by presenting the claims token and the permission ticket using a shared secret to authenticate itself with the AS-RO.
7. After an authorization assessment, it is positive, the AS-RO creates the RPT with a nonce claim. The nonce is generated on the AS or was sent as the permission ticket in the RPT request.
8. The AS-RO generates the Target Signature from the nonce claim, client CRI, RS CRI using HMAC(K, HMAC(K, m)) chain function; Target Signature = HMAC-SHA256(RS CRI, HMAC-SHA256(client CRI, nonce claim))
9. The AS-RO inserts the Target Signature into the RPT as an audience claim.
10. The AS-RO signs the RPT.
11. The AS-RO returns the RPT to the client.
12. The client generates the Signature from the nonce claim and client CRI using HMAC(K, m) function; Start Signature = HMAC-SHA256(client CRI, nonce claim)
13. The client makes an 'RS API' call that includes the RPT and the generated Signature.
14. The RS generates the Target Signature from the Signature and RS CRI using HMAC(K, m) function; Target Signature = HMAC-SHA256(RS CRI, Signature)
15. The RS compares the generated Target Signature with the RPT audience claim, it equals, the 'RS API' client-RS channel is verified.
16. The RS validates the RPT signature, it is valid, the RS allow access the protected 'RS API' resource.

### Notes

* Consider the client cookie variant.
* OAuth2 related: when the token endpoint is registered at the AS as a Confidential Endpoint, Channel-Bound Refresh Tokens are generated.
* OIDC related: an endpoint (e.g. UserInfo) may be registered at the AS-RqP as a Confidential Endpoint.
* ~~Employ the AES-GCM chain instead of HMAC chain to support encrypted tokens~~.