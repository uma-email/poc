// external libs
const express = require('express')
const app = express()
const cors = require('cors')
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

app.use(cors)
app.options('*', cors())

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
