# Itinerary-Bound Tokens

### Terminology

* Confidential Registration Identifier (CRI): A nonce that is generated at the AS-RO and returned to the registering party during the registration process. The CRI is not publicly available, it is only known to the AS-RO and the relevant registering party.
* Confidential Client: A client that has a shared secret and a shared CRI with the AS-RO.
* Confidential RS: A resource server that has a shared secret and a shared CRI with the AS-RO.

### Concept

This concept uses chained HMAC functions with multiple shared secret keys. The route is defined by the AS (start), client CRI (stop) and RS CRI (destination).

### Use Cases

A verifiable token route. This should work for both access and refresh tokens, provided that the proper route stops and endpoints are registered. 

Examples of token routes:

1. OAuth2: AS->client->RS (access token)
2. OAuth2: AS->client->AS (refresh token)
3. OAuth2 chained RS: AS->client->RS1->RS2
4. UMA wide ecosystem: AS1->client->AS2, AS2->client->RS

This mechanism can be used to verify the authorization code and UMA permission ticket route.

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
8. The AS-RO generates the Destination MAC from the nonce claim, client CRI, RS CRI using HMAC(K-destination, HMAC(K-stop, m)) chain function with multiple shared secret keys; Destination MAC = HMAC-SHA256(RS CRI, HMAC-SHA256(client CRI, nonce claim))
9. The AS-RO inserts the Destination MAC into the RPT as an audience claim.
10. The AS-RO signs the RPT with the AS-RO's private RSA key (K-private-start).
11. The AS-RO returns the RPT to the client.
12. The client generates the Stop MAC from the nonce claim and client CRI using HMAC(K-stop, m) function; Stop MAC = HMAC-SHA256(client CRI, nonce claim)
13. The client makes an 'RS API' call that includes the RPT and the generated Stop MAC.
14. The RS generates the Destination MAC from the Stop MAC and RS CRI using HMAC(K-destination, m) function; Destination MAC = HMAC-SHA256(RS CRI, Stop MAC)
15. The RS compares the generated Destination MAC with the RPT audience claim, it equals, the 'AS-client-RS API' route is verified.
16. The RS validates the RPT signature, it is valid, the RS allow access the protected 'RS API' resource.

### Notes

* ~~Consider the client cookie variant~~.
* For SPAs use Crypto API HMAC/non-extractable CryptoKey object stored in Indexed DB storage.
* ~~Employ the AES-GCM chain instead of HMAC chain to support encrypted tokens~~.