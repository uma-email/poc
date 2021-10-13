Terminology:

Confidential Registration Identifier (CRI): A nonce that is generated at the AS and returned to the registering party during the registration process. The CRI is not publicly available, it is only known to the AS and the relevant registering party.
Confidential Client: A client that has a shared secret and a shared CRI with the AS.
Confidential RS: A resource server that has a shared secret and a shared CRI with the AS.

Concept:

The channel is defined by the client CRI (start) and RS CRI (end).

Prerequisites:

The client is registered at the AS as a Confidential Client.
The RS is registered at the AS as a Confidential RS.

Steps:

Client requests an RPT by presenting the claims token and the permission ticket using a shared secret to authenticate itself with the AS.
After an authorization assessment, it is positive, the AS generates the RPT.
The AS generates the abc from the permission ticket, client CRI and RS CRI using HMAC(K, m) function; abc=HMAC-SHA256(rs_cri, HMAC-SHA256(client_cri, ticket))
The AS inserts the abc into the RPT as a PoP attribute.
The AS returns the RPT to the client.
The client generates the xyz from the permission ticket and client CRI using HMAC(K, m) function; xyz=HMAC-SHA256(client_cri, ticket)
With the valid RPT the client makes an 'RS API' call that includes the RPT and the generated xyz.
The RS generates the rs_abc from the xyz using HMAC(K, m) function; rs_abc=HMAC-SHA256(rs_cri, xyz)
The RS extracts abc from the RPT and compares it with the rs_abc, it equals, the 'RS API' call is from the proper client.
The RS validates the RPT, it is valid, the RS allow access the protected 'RS API' resource.