# Authorization-Enhanced Mail System (AEMS)

A prototype implementation of the [authorization-enhanced-mail-system][1] draft proposal, working as a proof of concept.

## Screenshot

![GUI](./images/gui.png)

# Decentralized Authorization Network

## Sequence diagrams

To transfer data from sender to recipient, AEMS uses the Decentralized Authorization Network (DAN) technology that is built around the UMA 2.0 protocol standard (AEMS ⊃ DAN ⊃ UMA 2.0).

DAN works without shared OIDC provider and without federated OIDC providers. There is no need to have a trust relationship (contract) between security domains foo.com and bar.com. This concept uses the UMA-compliant challenge–response mechanism with the permission ticket.

The RqP Client is pre-registered as a universal AEMS public client at the UMA server (an open network) or is registered as a confidential client (a closed network).

The diagrams are not vendor neutral; several Keycloak IAM features are used here (realm-management client, query-users and view-users roles) to get claims of any user.

### Push data

![Sequence Diagram - push data](./images/uma-compliant-communications-platform-alice-to-bob-push-data-alice-not-involved.png)

### Pull data

![Sequence Diagram - pull data](./images/uma-compliant-communications-platform-bob-from-alice-pull-data-bob-not-involved.png)

## Demo and Documentation

WIP, early stage [umabox.org][2].

## Acknowledgment

Credits go to [WG - User Managed Access][3].

[1]: https://github.com/uma-email/proposal
[2]: https://www.umabox.org
[3]: https://kantarainitiative.org/confluence/display/uma/Home