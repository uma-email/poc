const router = require('express').Router()
const JmapController = require('controllers/jmap')

router.post('/', JmapController.create)

module.exports = router
