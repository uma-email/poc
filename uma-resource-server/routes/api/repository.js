const router = require('express').Router()

const RepositoryController = require('controllers/repository')
const storage = require('middleware/storage')

// router.use('/', AllowMethods(['POST']), keycloak.protect(), require('./messages'))
router.get('/', RepositoryController.repositoryGetFileList)

router.get('/:id', RepositoryController.repositoryGetFile)

router.get('/:id/download', RepositoryController.repositoryGetFileDownload)

router.post('/', storage.upload.array('attachment'), RepositoryController.repositoryCreateFile)

router.delete('/:id', RepositoryController.repositoryDeleteFile)

module.exports = router
