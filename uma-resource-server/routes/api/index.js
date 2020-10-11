const router = require('express').Router()
/* const { keycloak } = require('services/Keycloak')
const AllowMethods = require('middlewares/AllowMethods') */

router.use('/repository', require('repository'))

module.exports = router
