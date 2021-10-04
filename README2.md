# Correlated Authorization (experimental)

## Abstract

Correlated Authorization (CAZ) is a dual-authority authorization protocol built on top of [User-Managed Access (UMA)][1] and [OAuth2][2] protocols that allows users (resource owners) to delegate access to other users (requesting parties) across security domain boundaries. The requesting party is responsible for creating the request, while the resource owner approves this request either when it is online or by creating a policy. The resource owner and the requesting party belong to different security domains administered by the respective authorities. This concept uses a permission ticket issued by the resource owner's authorization server as a correlation handle that binds the requesting party's claims to the authorization process. An email address is used as the unique requesting party identifier for cross-domain access control. The intrinsic challenge-response authentication protocol elevates trust between the resource owner's authorization server and requesting party's identity provider.

## Introduction

With the growing popularity of protocols based on the OAuth2 specification, there is a need for an interoperable standard that specifies how to convey information about the user from an identity provider to an authorization server, especially across security domain boundaries. The problem is that such a system is difficult to design because OAuth2, OIDC and UMA are single-authority protocols. This draft profiles and combines the OAuth2 and UMA protocols into a dual-authority protocol, which not only meets the needs of interoperability, but also elevates trust between mutually unknown parties.

## Motivation

CAZ is an attempt to revive UMA WG's original idea – [UMA wide ecosystem][9], when the resource owner and requesting party might "know each other" in the real world, but the resource owner's authorization server has no pre-established trust with the requesting party or any of their identity/claims providers – in other words, when the resource owner's authorization server and requesting party's identity provider don't know each other.

## UMA Wide Ecosystem Concept

## Challenge-Response Authentication Concept

## Sequence Diagram

The following sequence diagram describes the mechanism of the CAZ protocol, which relies on the token exchange extension of OAuth2, where an access token is used to obtain a claims token from the Security Token Service (STS) endpoint.

### UMA Profile

This diagram represents a profile of the experimental UMA protocol.

![Sequence Diagram - UMA experimental](./images/correlated-authz-uma-exper.png)

Prerequisites:

* Both authorization servers support the [OAuth 2.0 Token Exchange][5] extension of OAuth2.
* The AS-RqP also acts as RqP's Identity Provider.
* The AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server (alternatively on /.well-known/openid-configuration).
* The client is registered at the AS-RqP as a public or confidential client and acts as a Relying Party in a RqP's Identity Provider to obtain an access token with user claims.
* The client is registered at the AS-RO as a public or confidential client.
* The RO registers the RS at the AS-RO to protect its RS API.

Steps:

1. The RqP directs the client to get a permission ticket from the AS-RO to access the 'RS API' resource. The created permission ticket is an access token with a scope 'ticket'.
2. The AS-RO returns the permission ticket.
3. The client generates a ticket hash derived from the permission ticket using the following transformation ticket_hash = Base64URL-Encode(SHA256(ticket)).
4. At the AS-RqP the client requests a claims token by presenting the access token with user claims and the generated ticket hash.
5. The AS-RqP returns the claims (JWT) token.
6. At the AS-RO the client requests an access token via a JWT grant type by presenting the claims (JWT) token and the permission ticket.
7. After an authorization assessment, it is positive, the AS-RO returns the access token.
8. With the valid access token the client tries to access the 'RS API'.
9. The RS validates the access token, it is valid, the RS allow access the protected 'RS API' resource.

## Authority Boundaries, Interactions and Scenarios

The CAZ protocol allows us to indirectly (through the client) link identity providers with authorization services governed by different authorities that are not required to share information or collaborate.

The following scenarios demonstrate a system of trust between two authorities that allows the conveyance of identity information from identity providers to authorization services across security domain boundaries.

### Identity Federation Scenario

This scenario allows to use multiple authoritative identity providers with a single authorization service. The client falls under the governance of the resource owner's respective authority.

![Scenario-1](./images/authority-boundaries-scenario-1.svg)

### Federated Authorization Scenario

The federated authorization scenario shows the use of a single authoritative identity provider with multiple authorization services. The client falls under the governance of the requesting party's respective authority.

![Scenario-2](./images/authority-boundaries-scenario-2.svg)

### Combined Federation Scenario

As the name suggests, this scenario allows to use multiple authoritative identity providers with multiple authorization services. The client falls under the governance of a third-party authority.

![Scenario-3](./images/authority-boundaries-scenario-3.svg)

## Use Cases

Healthcare and enterprise cross-domain services e.g. email, file sharing, instant messaging, tele-conferencing. Also, Fintech and Telco services.

## Future Work

1. Consider a Correlated Authentication (CAN) protocol, where RS/AS acts as an external authoritative attribute/claims provider.
2. Employ the DPoP mechanism and create the permission ticket directly on the client to avoid the initial round trip to RS/AS.
3. Describe how the resource owner can use the CAZ protocol.
4. Consider using the CAZ mechanism to transfer digital/virtual assets in the form of transactions.

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