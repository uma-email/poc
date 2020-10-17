const https = require('https')
const http = require('http')
const fs = require('fs')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const sslRootCAs = require('ssl-root-cas')

const env = dotenv.config({
  path: './.config.env'
})
dotenvExpand(env)

// after dotenv.config

const app = require('app.js')
const { normalizePort, logger } = require('utils')

const port = normalizePort(process.env.BASE_PORT || '3000')
const host = process.env.BASE_HOSTNAME || 'localhost'
const baseDomainName = process.env.BASE_DOMAIN_NAME

let server

if (process.env.BASE_PROTOCOL === 'https') {
  sslRootCAs.addFile(`./certs/${baseDomainName}/cert.pem`)

  const options = {
    cert: fs.readFileSync(`./certs/${baseDomainName}/cert.pem`),
    key: fs.readFileSync(`./certs/${baseDomainName}/key.pem`)
  }

  server = https.createServer(options, app).listen(port, host, function () {
    logger.info(`Running on https://${host}${port === 443 ? '' : ':' + port}`)
  })
} else {
  server = http.createServer(app).listen(port, host, function () {
    logger.info(`Running on http://${host}${port === 80 ? '' : ':' + port}`)
  })
}

server.on('error', (error) => {
  logger.error({ stack: error }, error.message)
  throw error
})
