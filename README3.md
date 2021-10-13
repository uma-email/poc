### Terminology:

* Confidential Registration Identifier (CRI): A nonce that is generated at the AS and returned to the registering party during the registration process. The CRI is not publicly available, it is only known to the AS and the relevant registering party.
* Confidential Client: A client that has a shared secret and a shared CRI with the AS.
* Confidential RS: A resource server that has a shared secret and a shared CRI with the AS.

### Concept:

The channel is defined by the client CRI (start) and RS CRI (end).

### Prerequisites:

* The client is registered at the AS as a Confidential Client.
* The RS is registered at the AS as a Confidential RS.

### Steps:

1. Client requests an RPT by presenting the claims token and the permission ticket using a shared secret to authenticate itself with the AS.
2. After an authorization assessment, it is positive, the AS generates the RPT.
3. The AS generates the abc from the permission ticket, client CRI and RS CRI using HMAC(K, m) function; abc=HMAC-SHA256(rs_cri, HMAC-SHA256(client_cri, ticket))
4. The AS inserts the abc into the RPT as a PoP attribute.
5. The AS returns the RPT to the client.
6. The client generates the xyz from the permission ticket and client CRI using HMAC(K, m) function; xyz=HMAC-SHA256(client_cri, ticket)
7. With the valid RPT the client makes an 'RS API' call that includes the RPT and the generated xyz.
8. The RS generates the rs_abc from the xyz using HMAC(K, m) function; rs_abc=HMAC-SHA256(rs_cri, xyz)
9. The RS extracts abc from the RPT and compares it with the rs_abc, it equals, the 'RS API' call is from the proper client.
10. The RS validates the RPT, it is valid, the RS allow access the protected 'RS API' resource.