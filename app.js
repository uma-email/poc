// external libs
const express = require('express')
const app = express()
const helmet = require('helmet')
const bodyParser = require('body-parser')
const session = require('express-session')
const fs = require('fs')
// const path = require('path')

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

function stringInject (str, data) {
  if (typeof str === 'string' && (data instanceof Array)) {
    return str.replace(/(\${\d})/g, function (i) {
      return data[i.replace(/\${/, '').replace(/}/, '')]
    })
  } else if (typeof str === 'string' && (data instanceof Object)) {
    for (const key in data) {
      return str.replace(/(\${([^}]+)})/g, function (i) {
        const key = i.replace(/\${/, '').replace(/}/, '')
        if (!data[key]) {
          return i
        }
        return data[key]
      })
    }
  } else {
    return false
  }
}

// OpenAPI UI routes
app.use('/openapi', express.static('./openapi-ui'))

app.get('/openapi/server.yaml', function (req, res) {
  fs.readFile('./openapi/server.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

app.get('/openapi/email.yaml', function (req, res) {
  fs.readFile('./openapi/email.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

app.get('/openapi/contacts.yaml', function (req, res) {
  fs.readFile('./openapi/contacts.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

app.get('/openapi/tags.yaml', function (req, res) {
  fs.readFile('./openapi/tags.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

app.get('/openapi/labels.yaml', function (req, res) {
  fs.readFile('./openapi/labels.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

app.get('/openapi/filters.yaml', function (req, res) {
  fs.readFile('./openapi/filters.yaml', 'utf-8', function (err, data) {
    if (err) {
      res.send(404)
    } else {
      const openapiUiConfig = stringInject(data, process.env)
      res.send(openapiUiConfig)
    }
  })
})

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
