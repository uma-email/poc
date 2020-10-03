// model
const Message = require('models/message')

// errors classes
const { ValidationError } = require('sequelize') // see more: https://sequelize.org/master/identifiers.html#errors
const { BadRequest } = require('http-errors') // see more: https://www.npmjs.com/package/http-errors

module.exports = {
  async create (req, res, next) {
    try {
      const message = await Message.create(req.body)

      return message
    } catch (error) {
      if (error instanceof ValidationError) {
        return next(BadRequest(error.message))
      }

      return next(error)
    }
  },

  async update (req, res, next) {
    res.send('update')
  },

  async delete (req, res, next) {
    res.send('delete')
  },

  async get (req, res, next) {
    res.send('get')
  },

  async find (req, res, next) {
    res.send('find')
  }
}
