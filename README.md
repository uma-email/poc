# Webmail
A prototype implementation of the [authorization-enhanced-mail-system][1] draft proposal, working as a proof of concept.

The project comes with:

* apis: A Webmail OpenAPI specification.
* databases: Webmail database SQL scripts.
* server: A RESTful Webmail service that communicates with your email provider.
* client: A Webmail client to call REST API against Webmail service.

## Running Webmail

The project is a standard Maven project, so you can import it to your IDE of choice. You'll need to have Java 11+ and Node.js 10+ installed.

To run Webmail from the command line, use `mvn` and open [http://localhost:8080](http://localhost:8080) in your browser.

## Deploying using Docker

To build the Dockerized version of the Webmail project, run

```
docker build . -t webmail:latest
```

Once the Docker image is correctly built, you can test it locally using

```
docker run -p 8080:8080 webmail:latest
```

Support for code in this repository is limited.

[1]: https://github.com/uma-email/proposal
