const path = require('path')
const fs = require('fs')
// const validators = require('./validators')

exports.repositoryGetFileList = (req, res, next) => {
  const db = req.app.get('db')

  db.read_file(req.user.email, null)
    .then(response => {
      res.status(200).json({
        status: 0,
        count: response.length,
        info: 'Success',
        data: response
      })
    }).catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}

exports.repositoryGetFile = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      status: -1,
      count: 0,
      info: 'The "id" is required',
      data: {}
    })
  }

  const id = parseInt(req.params.id, 10) // bigint!!!

  const db = req.app.get('db')

  db.read_file(req.user.email, id)
    .then(response => {
      res.status(200).json({
        status: 0,
        count: response.length,
        info: 'Success',
        data: response
      })
    }).catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}

exports.repositoryGetFileDownload = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      status: -1,
      count: 0,
      info: 'The "id" is required',
      data: {}
    })
  }

  const id = parseInt(req.params.id, 10) // bigint!!!

  const db = req.app.get('db')

  db.read_file(req.user.email, id)
    .then(response => {
      if (response && (response.length > 0) && response[0].filename) {
        const filepath = path.resolve(path.join(response[0].destination, response[0].uufcid)) // !!!
        fs.stat(filepath, (err, stats) => {
          if (err) {
            return res.status(404).json({
              status: -1,
              count: 0,
              info: `The file id/uufcid: ${id}/${response[0].uufcid} not found in the '${response[0].destination}' destination path`,
              data: {}
            })
          }
          if (stats.isFile()) {
            const readerStream = fs.createReadStream(filepath)
            readerStream.on('error', function (err) {
              return res.status(404).json({
                status: -1,
                count: 0,
                info: `The file id: ${id} ${err}`,
                data: {}
              })
            })

            res.header('Content-Disposition', `attachment; filename="${response[0].filename}"`)
            res.header('Content-Type', response[0].mimetype)
            readerStream.pipe(res)
          } else {
            return res.status(404).json({
              status: -1,
              count: 0,
              info: `The file id/uufcid: ${id}/${response[0].uufcid} not found in the '${response[0].destination}' destination path`,
              data: {}
            })
          }
        })
      } else {
        res.status(404).json({
          status: -1,
          count: 0,
          info: `The file id ${id} not found`,
          data: {}
        })
      }
    }).catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}

exports.repositoryCreateFile = (req, res, next) => {
  if (!(req.files && req.files.length > 0)) {
    return res.status(400).json({
      status: -1,
      count: 0,
      info: 'No file(s) to save',
      data: {}
    })
  }

  const reqFiles = req.files
  const files = []

  for (const elm of reqFiles) {
    elm.uufcid = elm.filename
    delete elm.filename
    elm.filename = elm.originalname
    delete elm.originalname
    delete elm.fieldname
    delete elm.name
    delete elm.path
    files.push(elm)
  }

  const db = req.app.get('db')

  db.create_file(req.user.email, JSON.stringify(files))
    .then(response => {
      if (response && (response.length > 0) && response[0].create_file.length > 0) {
        res.status(201).json({
          status: 0,
          count: response[0].create_file.length,
          info: 'File(s) created',
          data: response[0].create_file // {id: response[0].create_message}
        })
      } else {
        res.status(404).json({
          status: -1,
          count: 0,
          info: 'The file(s) not created',
          data: {}
        })
      }
    }).catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}

exports.repositoryDeleteFile = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      status: -1,
      count: 0,
      info: 'The "id" is required',
      data: {}
    })
  }

  const id = parseInt(req.params.id, 10) // bigint!!!

  const db = req.app.get('db')

  db.delete_file(req.user.email, id)
    .then(response => {
      if (response && (response.length > 0) && (response[0].delete_file > 0)) {
        res.status(200).json({
          status: 0,
          count: response.length,
          info: 'File(s) deleted',
          data: {}
        })
      } else {
        res.status(404).json({
          status: -1,
          count: 0,
          info: `The file id ${id} not found`,
          data: {}
        })
      }
    }).catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
}
