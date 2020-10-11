const uuidv4 = require('uuid/v4')
const multer = require('multer')

const filesPath = './repository/'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filesPath)
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4())
  }
})

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, true)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2 * 1024 // 2GB
  },
  fileFilter: fileFilter
})

module.exports = {
  upload: upload
}
