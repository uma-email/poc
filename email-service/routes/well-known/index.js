
const router = require('express').Router()
const WellKnownController = require('controllers/well-known')

router.get('/.well-known/jmap', WellKnownController.get)

module.exports = router
