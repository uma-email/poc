// external libs
const express = require('express')
const app = express()
const helmet = require('helmet')
const bodyParser = require('body-parser')
const session = require('express-session')

// routes
const indexRouter = require('routes/index')

// utils
const { logger } = require('utils')

// services
const { keycloak, store } = require('services/Keycloak')

// errors classes
const { HttpError } = require('http-errors')

app.set('trust proxy', true)

app.use(session({
  store,
  secret: process.env.SESSION_SECRET || 'cookiesecret',
  resave: false,
  domain: `.${process.env.BASE_DOMAIN_NAME}`,
  saveUninitialized: false,
  cookie: {
    // path: '/',
    domain: process.env.BASE_DOMAIN_NAME
    // maxAge: 1000 * 60 // 365 * 24 * 60 * 60 * 1000; // one year
  }
}))

app.use(bodyParser.json())
app.use(helmet())
app.use(keycloak.middleware())

app.use(indexRouter)

app.use(keycloak.middleware({
  logout: '/logout'
}))

app.use((req, res, next) => {
  res.header('Content-Security-Policy', 'unsafe-hashes') // !!!
  // res.header('Access-Control-Allow-Origin', 'https://mrin9.github.io')
  if (req.headers.referer && req.headers.referer.startsWith(process.env.BASE_INBOX_SERVER_URL)) {
    res.header('Access-Control-Allow-Origin', process.env.BASE_INBOX_SERVER_URL)
  } else if (req.headers.referer && req.headers.referer.startsWith(process.env.BASE_WEBMAIL_SERVER_URL)) {
    res.header('Access-Control-Allow-Origin', process.env.BASE_WEBMAIL_SERVER_URL)
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With'
  )
  res.header(
    'Access-Control-Allow-Credentials',
    'true'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
    return res.status(200).json({})
  }
  next()
})

// static routes
app.use('/', express.static('../jmap-demo-webmail'))

app.use(function (error, req, res, next) {
  if (error instanceof HttpError) {
    logger.error(error)

    return res.status(error.status).send(error.message)
  }

  return next(error)
})

app.use(function (error, req, res, next) {
  logger.fatal(error, 'Internal server error')

  return res.status(500).send('Internal server error')
})

module.exports = app
