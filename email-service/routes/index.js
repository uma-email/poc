const router = require('express').Router()

router.use('/', require('./well-known'))
router.use('/api', require('./api'))
router.use('/event', require('./event'))

module.exports = router
