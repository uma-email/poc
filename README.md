# Authorization-Enhanced Mail System

A prototype implementation of the [Authorization-Enhanced Mail System (AEMS)][1] draft proposal, working as a proof of concept.

## Screenshot

![GUI](./images/gui.png)

# Correlated Authorization

To transfer data from sender to recipient, AEMS uses the [Correlated Authorization][2] technology that was designed with the [User-Managed Access (UMA) protocol][3] vision in mind.

Correlated Authorization is a Double Cross-Domain Authorization mechanism that works without shared central OIDC provider as well as without federated OIDC providers. This concept uses the permission ticket as a correlation handler between two authorization processes.

## Sequence diagrams

### UMA-compliant

![Sequence Diagram - uma-compliant](./images/correlated-authz-uma.png)

### Generic

![Sequence Diagram - generic](./images/correlated-authz-generic.png)

## Demo and Documentation

WIP, early stage [umabox.org][4].

## Acknowledgment

Credits go to [WG - User Managed Access][3].

[1]: https://github.com/uma-email/proposal
[2]: https://github.com/uma-email/proposal
[3]: https://kantarainitiative.org/confluence/display/uma/Home
[4]: https://www.umabox.org
