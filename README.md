# Authorization-Enhanced Mail System (AEMS)

A prototype implementation of the [authorization-enhanced-mail-system][1] draft proposal, working as a proof of concept.

## Screenshot

![GUI](./images/gui.png)

## Schematic Flows

### Push email links

![Schematic Flow - push data](./images/schematic-flow-push.png)

### Pull email data

![Schematic Flow - pull data](./images/schematic-flow-pull.png)

## Sequence diagrams

To transfer data from sender to recipient, AEMS uses a push/pull mechanism and an UMA wide ecosystem topology (UMA wide ecosystem ⊃ UMA narrow ecosystem).

This concept works without shared OIDC provider or without federated OIDC providers.
There is no contract between security domains. This concept uses a challenge–response authentication with correlation handle.

In addition to claims_token, pushed claims may also contain metadata such as: recipient_info (email address, fullname), file_info (filename, file size, file digest, mime type).

### Push data

![Sequence Diagram - push data](./images/uma-wide-ecosystem-alice-to-bob-push-data.svg)

### Pull data

![Sequence Diagram - pull data](./images/uma-wide-ecosystem-bob-from-alice-pull-data.svg)

## Demo and Documentation

WIP, early stage [umabox.org][2].

[1]: https://github.com/uma-email/proposal
[2]: https://www.umabox.org
