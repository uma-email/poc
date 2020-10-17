
const router = require('express').Router()
/* const { keycloak } = require('services/Keycloak')
const AllowMethods = require('middlewares/AllowMethods')

router.use('/messages', AllowMethods(['POST']), keycloak.protect(), require('./messages')) */
// router.use('/messages', require('./messages'))
router.use('/', require('./jmap'))

module.exports = router
