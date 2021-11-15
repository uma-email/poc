# Correlated Authorization

## Abstract

Correlated Authorization (CAZ) is a dual-authority authorization protocol built on top of [User-Managed Access (UMA)][1] and [OAuth2][2] protocols that allows users (resource owners) to delegate access to other users (requesting parties) across security domain boundaries. The requesting party is responsible for creating the request, while the resource owner approves this request either when it is online or by creating a policy. The resource owner and the requesting party belong to different security domains administered by the respective authorities. This concept uses a permission ticket issued by the resource owner's authorization server as a correlation handle that binds the requesting party's claims to the authorization process. An email address is used as the unique requesting party identifier for cross-domain access control. The intrinsic challenge-response authentication protocol elevates trust between the resource owner's authorization server and requesting party's identity provider.

## Introduction

With the growing popularity of protocols based on the OAuth2 specification, there is a need for an interoperable standard that specifies how to convey information about the user from an identity provider to an authorization server, especially across security domain boundaries. The problem is that such a system is difficult to design because OAuth2, OIDC and UMA are single-authority protocols. This draft profiles and combines the OAuth2 and UMA protocols into a dual-authority protocol, which not only meets the needs of interoperability, but also elevates trust between mutually unknown parties.

## Motivation

CAZ is an attempt to revive UMA WG's original idea – [UMA wide ecosystem][9], when the resource owner and requesting party might "know each other" in the real world, but the resource owner's authorization server has no pre-established trust with the requesting party or any of their identity/claims providers – in other words, when the resource owner's authorization server and requesting party's identity provider don't know each other.

## UMA Wide Ecosystem Concept

This high-level view gives you an idea of relationships between UMA wide ecosystem entities. The authority Foo and Bar may or may not be the same authority.

![UMA Wide Ecosystem](./images/uma-wide-ecosystem.png)

## Challenge-Response Authentication Concept

This unilateral entity authentication protocol elevates trust between the resource owner's authorization server and requesting party's identity provider. The authority Foo and Bar may or may not be the same authority.

![Challenge-Response Authentication](./images/challenge-response-authentication.png)

The ticket represents a random challenge and the signed ticket hash represents the response. The hash of the ticket has to be there in order not to reveal the UMA permission ticket to the authenticator.

## Sequence Diagrams

The following sequence diagrams describe the mechanism of the CAZ protocol, which relies on the token exchange extension of OAuth2, where an access token is used to obtain a claims token from the Security Token Service (STS) endpoint.

### UMA Profile

This diagram represents a profile of the UMA protocol and is in full compliance with the UMA 2.0 specification.

![Sequence Diagram – UMA](./images/correlated-authz-uma.png)

Prerequisites:

* The AS-RqP supports the [OAuth 2.0 Token Exchange][5] extension of OAuth2.
* The AS-RqP also acts as RqP's Identity Provider.
* The AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server (alternatively on /.well-known/openid-configuration).
* The client is registered at the AS-RqP as a public or confidential client and acts as a Relying Party in a RqP's Identity Provider to obtain an access token with user claims.
* The client is registered at the AS-RO as a public or confidential client.
* The RO has set up the RS and registers its 'RS API' resource at the AS-RO according to the [UMA Federated Authorization][6] specification.

Steps:

1. The RqP directs the client to access the 'RS API' resource with no access token.
2. Without an access token, the RS will return HTTP code 401 (Unauthorized) with a permission ticket.
3. The client generates a ticket hash derived from the permission ticket using the following transformation ticket_hash = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the client requests a claims token by presenting the access token with user claims and the generated ticket hash.
5. The AS-RqP returns the claims token.
6. At the AS-RO the client requests an RPT by presenting the claims token and the permission ticket.
7. After an authorization assessment, it is positive, the AS-RO returns RPT.
8. With the valid RPT the client tries to access the 'RS API'.
9. The RS validates the RPT, it is valid, the RS allow access the protected 'RS API' resource. 

### Protected Dynamic Client Registration

This diagram shows how the resource owner's authorization server can protect its own client registration endpoint by using the CAZ protocol. An initial RPT is required when making registration requests. This allows the resource owner to manage each RqP's client separately.

![Sequence Diagram – Dynamic Client Registration](./images/correlated-authz-dynamic-client-registration.png)

Prerequisites:

* The AS-RqP supports the [OAuth 2.0 Token Exchange][5] extension of OAuth2.
* The AS-RqP also acts as RqP's Identity Provider.
* The AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server (alternatively on /.well-known/openid-configuration).
* The client is registered at the AS-RqP as a public or confidential client and acts as a Relying Party in a RqP's Identity Provider to obtain an access token with user claims.
* OPTIONAL. The client is registered at the AS-RO as a public client – this is recommended for Single Page Applications.
* The CRE is an UMA-protected resource that accepts an initial RPT to limit registration to only authorized RqPs.

Steps:

1. The RqP directs the client to access the CRE resource with no access token.
2. Without an access token, the CRE will return HTTP code 401 (Unauthorized) with a permission ticket.
3. The client generates a ticket hash derived from the permission ticket using the following transformation ticket_hash = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the client requests a claims token by presenting the access token with user claims and the generated ticket hash.
5. The AS-RqP returns the claims token.
6. At the AS-RO the client requests an RPT by presenting the claims token and the permission ticket.
7. After an authorization assessment, it is positive, the AS-RO returns RPT.
8. With the valid RPT the client sends the registration request to the CRE.
9. The CRE validates the RPT, it is valid, the CRE returns the client information response.

If the client has been pre-registered at the RO's AS as a public client, then after the protected dynamic registration, the client is registered twice, both as a public and at the same time as a confidential client. When communicating with the AS, the client uses the registration that is more secure. If the client is a Single Page Application, the confidential registration identifier (nonce), which is mapped to the client credentials, has to be returned from the registration endpoint in the form of a cookie with the HttpOnly and Secure attributes set. If the RqP deletes the cookies or the confidential client registration has been removed from the server, the client may re-register with the RO's AS.

## Authority Boundaries, Interactions and Scenarios

The CAZ protocol allows us to indirectly (through the client) link identity providers with authorization services governed by different authorities that are not required to share information or collaborate.

The following scenarios demonstrate a system of trust between two authorities that allows the conveyance of identity information from identity providers to authorization services across security domain boundaries.

### Identity Federation Scenario

This scenario allows to use multiple authoritative identity providers with a single authorization service. The client falls under the governance of the resource owner's respective authority.

![Scenario-1](./images/authority-boundaries-scenario-1.png)

### Federated Authorization Scenario

The federated authorization scenario shows the use of a single authoritative identity provider with multiple authorization services. The client falls under the governance of the requesting party's respective authority.

![Scenario-2](./images/authority-boundaries-scenario-2.png)

### Combined Federation Scenario

As the name suggests, this scenario allows to use multiple authoritative identity providers with multiple authorization services. The client falls under the governance of a third-party authority.

![Scenario-3](./images/authority-boundaries-scenario-3.png)

## Use Cases

Healthcare and enterprise cross-domain services e.g. email, file sharing, instant messaging, tele-conferencing. Also, Fintech and Telco services.

## Future Work

1. Consider a Correlated Authentication (CAN) protocol, where RS/AS acts as an external authoritative attribute/claims provider.
2. Employ the DPoP mechanism and create the permission ticket directly on the client to avoid the initial round trip to RS/AS.
3. Describe how the resource owner can use the CAZ protocol.
4. Consider using the CAZ mechanism to transfer digital/virtual assets in the form of transactions.

# Itinerary-Bound Tokens

## Introduction

## Concept

**chained-proof-of-possession (authenticity protection)**

HMAC(K3, HMAC(K2, HMAC(K1, m1)))

**chained-message-checksum (integrity protection)**

HMAC(HMAC(HMAC(K1, m1), m2, m3))

**chained authenticity and integrity protection**

HMAC(HMAC(K3, HMAC(HMAC(K2, HMAC(K1, m1)), m2)), m3)

## Use Patterns

### Itinerary-Bound OAuth2 Access Tokens

![itinerary-bound-access-tokens](./images/itinerary-bound-access-tokens.png)

**Prerequisites**

**Steps**

### Itinerary-Bound OAuth2 Refresh Tokens

![itinerary-bound-refresh-tokens](./images/itinerary-bound-refresh-tokens.png)

**Prerequisites**

**Steps**

## Conclusion

## Future Work

# Authorization-Enhanced Mail System

A prototype implementation of the Authorization-Enhanced Mail System (AEMS) draft proposal, working as a proof of the concept of CAZ.

AEMS provides a mechanism to store, share and transfer information across security domains. From the user's point of view, AEMS looks like a standard email system.

## Screenshot

![GUI](./images/gui.png)
## Demo and Documentation

WIP, early stage [umabox.org][7].

## Acknowledgment

Credits go to [WG - User-Managed Access][8].

[1]: https://en.wikipedia.org/wiki/User-Managed_Access
[2]: https://datatracker.ietf.org/doc/html/rfc6749
[3]: https://github.com/uma-email/proposal/blob/master/correlated-authorization-draft-00.pdf
[4]: https://github.com/uma-email/proposal/blob/master/authorization-enhanced-mail-system-draft-02.pdf
[5]: https://www.rfc-editor.org/rfc/rfc8693.html
[6]: https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-federated-authz-2.0.html
[7]: https://www.umabox.org
[8]: https://kantarainitiative.org/confluence/display/uma/Home
[9]: https://kantarainitiative.org/confluence/display/uma/UMA+Roadmap+for+2016
