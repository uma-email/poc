
const router = require('express').Router()
const EventController = require('controllers/event')

router.get('/', EventController.create)

module.exports = router
