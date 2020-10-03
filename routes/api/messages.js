const router = require('express').Router()
const Messages = require('controllers/messages')

router.get('/:id', Messages.get)
router.get('/', Messages.find)
router.post('/', Messages.create)
router.put('/:id', Messages.update)
router.delete('/:id', Messages.delete)

module.exports = router
