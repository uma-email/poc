const { NotImplemented } = require('http-errors')

function AllowMethods (methods = []) {
  methods = methods.map(m => String(m).toUpperCase())

  return (req, res, next) => {
    if (methods.includes(req.method)) {
      return next()
    }

    return next(new NotImplemented())
  }
}

module.exports = AllowMethods
