# Correlated Authorization

[Correlated Authorization][2] is a dual cross-domain authorization mechanism originated from the [User-Managed Access][1] (UMA) protocol that allows users (resource owners) to delegate access to other users (requesting parties). The requesting party is responsible for creating the request, while the resource owner approves the transaction asynchronously. The resource owner and the requesting party may belong to different security domains (realms) or may use mutually isolated instances of the authorization server residing on different network domains. They may also use independent identity providers, there is no need to share an OIDC provider or use federated OIDC providers. This concept uses a permission ticket as a correlation handler between two authorization processes and an e-mail address as a unique requesting party identifier for cross-domain access control.

## Sequence diagrams

### UMA profile

This diagram is in full compliance with the UMA specification.

![Sequence Diagram - uma-compliant](./images/correlated-authz-uma.png)

Prerequisites:

* Both authorization servers support the token exchange extension of OAuth2 ([RFC 8693][4]).
* The AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server.
* The RqP Client is registered at the AS-RqP as a public or confidential client and is authorized at the AS-RqP by a RP and has an access token with user claims.
* The RqP Client is registered at the AS-RO as a public or confidential client.
* The RO has set up the RS and registers its 'RS API' resource at the AS-RO according to the [UMA Federated Authorization][5] specification.

Steps:

1. The RqP directs the RqP Client to access the 'RS API' resource with no access token.
2. Without an access token, the RS will return HTTP code 401 (Unauthorized) with a permission ticket.
3. The RqP Client creates a ticket challenge derived from the permission ticket using the following transformation ticket_challenge = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the RqP Client requests a claims token by presenting the access token with user claims and the created ticket challenge.
5. The AS-RqP returns the claims token.
6. At the AS-RO the RqP Client requests an RPT by presenting the claims token and the permission ticket.
7. After an authorization assessment, it is positive, the AS-RO returns RPT.
8. With the valid RPT the RqP Client tries to access the 'RS API'.
9. The RS validates the RPT, it is valid, the RS allow access the protected 'RS API' resource. 

### Generic

This is a generic diagram missing some UMA features.

![Sequence Diagram - generic](./images/correlated-authz-generic.png)

Prerequisites:

* Both authorization servers support the token exchange extension of OAuth2 ([RFC 8693][4]).
* The AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server.
* The RqP Client is registered at the AS-RqP as a public or confidential client and is authorized at the AS-RqP by a RP and has an access token with user claims.
* The RqP Client is registered at the AS-RO as a public or confidential client..
* The RO registers the RS at the AS-RO to protect its RS API.

Steps:

1. The RqP Client requests the AS-RO to get a permission ticket to access the 'RS API' resource. The created permission ticket is an access token with a scope 'ticket'.
2. The AS-RO returns the permission ticket.
3. The RqP Client creates a ticket challenge derived from the permission ticket using the following transformation ticket_challenge = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the RqP Client requests a claims token by presenting the access token with user claims and the created ticket challenge.
5. The AS-RqP returns the claims token.
6. At the AS-RO the RqP Client requests an access token by presenting the claims token and the permission ticket.
7. After an authorization assessment, it is positive, the AS-RO returns the access token.
8. With the valid access token the RqP Client tries to access the 'RS API'.
9. The RS validates the access token, it is valid, the RS allow access the protected 'RS API' resource.

## Use cases

Healthcare and enterprise cross-domain services e.g. email, file sharing, instant messaging, tele-conferencing.

# Authorization-Enhanced Mail System

A prototype implementation of the [Authorization-Enhanced Mail System][3] (AEMS) draft proposal, working as a proof of the concept of Correlated Authorization.

## Screenshot

![GUI](./images/gui.png)
## Demo and Documentation

WIP, early stage [umabox.org][6].

## Acknowledgment

Credits go to [WG - User-Managed Access][7].

[1]: https://en.wikipedia.org/wiki/User-Managed_Access
[2]: https://github.com/uma-email/proposal/blob/master/correlated-authorization-draft-00.pdf
[3]: https://github.com/uma-email/proposal/blob/master/authorization-enhanced-mail-system-draft-02.pdf
[4]: https://www.rfc-editor.org/rfc/rfc8693.html
[5]: https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-federated-authz-2.0.html
[6]: https://www.umabox.org
[7]: https://kantarainitiative.org/confluence/display/uma/Home
