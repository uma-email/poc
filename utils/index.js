const pino = require('pino')

// 'fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'.
const logger = pino({
  name: process.env.NAME,
  formatters: {
    level (label) {
      return { level: label }
    }
  }
})

/**
 * Adjust port number to Number format
 * @param {String|Number} val - Port number
 */
function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

module.exports = {
  logger,
  normalizePort
}
