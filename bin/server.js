const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const env = dotenv.config({
  path: './.config.env'
})
dotenvExpand(env)

// after dotenv.config
const http = require('http')
const app = require('app')
const { normalizePort, logger } = require('utils')

const port = normalizePort(process.env.PORT || '3000')
const host = process.env.HOST || 'localhost'

const server = http.createServer(app)

server.listen(port, host)

server.on('error', (error) => {
  logger.error({ stack: error }, error.message)
  throw error
})

server.on('listening', () => {
  logger.info(`Running on http://${host}${port === 80 ? '' : ':' + port}`)
})
