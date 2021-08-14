# Authorization-Enhanced Mail System

A prototype implementation of the [Authorization-Enhanced Mail System (AEMS)][1] draft proposal, working as a proof of concept.

## Screenshot

![GUI](./images/gui.png)

# Correlated Authorization

To transfer data from sender to recipient, AEMS uses [Correlated Authorization][2] technology, which has been designed with the "cross-domain access control" in mind.

Correlated Authorization is a Double Cross-Domain Authorization mechanism that works without shared central OIDC provider as well as without federated OIDC providers.

Both the requesting party and the resource owner use mutually independent authorization servers. This concept uses the permission ticket as a correlation handler between two authorization processes.

## Sequence diagrams

### UMA-compliant

![Sequence Diagram - uma-compliant](./images/correlated-authz-uma.png)

Prerequisites:

* Both authorization servers support the token exchange extension of OAuth2 ([RFC 8693][3]).
* AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server.
* RqP Client is registered at AS-RqP as a public or confidential client and is authorized at AS-RqP by RP and has an access token with user claims.
* RqP Client is registered at AS-RO as a public or confidential client.
* RO has set up RS and registers its 'RS API' resource at AS-RO according to the [UMA Federated Authorization][4] specification.

Steps:

1. ...
2. ...

### Generic

![Sequence Diagram - generic](./images/correlated-authz-generic.png)

Prerequisites:

* Both authorization servers support the token exchange extension of OAuth2 ([RFC 8693][3]).
* AS-RqP publishes its metadata on a URL /.well-known/oauth-authorization-server.
* RqP Client is registered at AS-RqP as a public or confidential client and is authorized at AS-RqP by RP and has an access token with user claims.
* RqP Client is registered at AS-RO as a public or confidential client.
* RO registers RS at AS-RO to protect its RS API.

Steps:

1. ...
2. ...

## Demo and Documentation

WIP, early stage [umabox.org][6].

## Acknowledgment

Credits go to [WG - User Managed Access][5].

[1]: https://github.com/uma-email/proposal/blob/master/authorization-enhanced-mail-system-draft-02.pdf
[2]: https://github.com/uma-email/proposal/blob/master/correlated-authorization-draft-00.pdf
[3]: https://www.rfc-editor.org/rfc/rfc8693.html
[4]: https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-federated-authz-2.0.html
[5]: https://kantarainitiative.org/confluence/display/uma/Home
[6]: https://www.umabox.org
