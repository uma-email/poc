# Channel-Bound Tokens

### Terminology

* Confidential Registration Identifier (CRI): A nonce that is generated at the AS and returned to the registering party during the registration process. The CRI is not publicly available, it is only known to the AS and the relevant registering party.
* Confidential Client: A client that has a shared secret and a shared CRI with the AS.
* Confidential RS: A resource server that has a shared secret and a shared CRI with the AS.

### Concept

The channel is defined by the client CRI (start) and RS CRI (target).

### Prerequisites

* The client is registered at the AS as a Confidential Client.
* The RS is registered at the AS as a Confidential RS.

### Steps (basic variant)

1. The client requests an RPT by presenting the claims token and the permission ticket using a shared secret to authenticate itself with the AS.
2. After an authorization assessment, it is positive, the AS generates the RPT with a nonce claim.
3. The AS generates the Target Signature from the nonce claim, client CRI, RS CRI using HMAC(K, HMAC(K, m)) chain function; Target Signature = HMAC-SHA256(RS CRI, HMAC-SHA256(client CRI, nonce claim))
4. The AS inserts the Target Signature into the RPT as a target_signature claim.
5. The AS signs the RPT.
6. The AS returns the RPT to the client.
7. The client generates the Signature from the nonce claim and client CRI using HMAC(K, m) function; Start Signature = HMAC-SHA256(client CRI, nonce claim)
8. The client makes an 'RS API' call that includes the RPT and the generated Signature.
9. The RS generates the Target Signature from the Signature and RS CRI using HMAC(K, m) function; Target Signature = HMAC-SHA256(RS CRI, Signature)
10. The RS compares the generated Target Signature with the the RPT target_signature claim, it equals, the 'RS API' start-target channel is verified.
11. The RS validates the RPT signature, it is valid, the RS allow access the protected 'RS API' resource.

### Notes

* An endpoint (e.g. UserInfo) may be registered at the AS as a Confidential Endpoint.
* Consider the client cookie variant.
* ~~Employ the AES-GCM chain instead of HMAC chain to support encrypted tokens~~.
