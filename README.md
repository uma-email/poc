# aems
A prototype implementation of the [authorization-enhanced-mail-system][1] draft proposal, working as a proof of concept.

The project comes with:

* apis: An  OpenAPI specification.
* databases: Database SQL scripts.
* server: A RESTful Resource Server service that communicates with your email provider.
* apiapp: An OpenAPI spec viewer
* mailapp: A PWA webmail client to call REST API against service.

## Running Server

To run server from the command line, use `node`.

## Deploying server using Docker

To build the Dockerized version of the server, run

```
docker build . -t aems:latest
```

Once the Docker image is correctly built, you can test it locally using

```
docker run -p 8080:8080 aems:latest
```

Support for code in this repository is limited.

[1]: https://github.com/uma-email/proposal
