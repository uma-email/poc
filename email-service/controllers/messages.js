// model
const Message = require('models/message')

// errors classes
const { QueryTypes, ValidationError } = require('sequelize') // see more: https://sequelize.org/master/identifiers.html#errors
const { BadRequest } = require('http-errors') // see more: https://www.npmjs.com/package/http-errors
var sequelize = require('../config/sequelize')

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
    const owner = 'john.doe@foo.org' // required
    const id = 1001 // required
    const params = [owner, id]
    try {
      const sqlStatement = messageView(id, null)
      const message = await sequelize.query(sqlStatement, {
        bind: params,
        type: QueryTypes.SELECT
      })
      res.send(message)
    } catch (error) {
      if (error instanceof ValidationError) {
        return next(BadRequest(error.message))
      }
      return next(error)
    }
  },

  async find (req, res, next) {
    const owner = 'john.doe@foo.org' // required
    const labelIds = [3143, 3133] // required value
    const params = [owner, ...labelIds]
    // const where = labelIds.map((labelId, i) => `cast(flbl.label_id AS BLOB) = cast($${i} AS BLOB)`).join(' OR ')
    // const where = labelIds.map(labelId => `cast(flbl.label_id AS BLOB) = cast(${labelId} AS BLOB)`).join(' OR ')
    // console.log(where)
    try {
      // const messages = await Message.findAll({})
      const sqlStatement = messageView(null, labelIds)
      const messages = await sequelize.query(sqlStatement, {
        // bind: { owner },
        bind: params,
        type: QueryTypes.SELECT
      })
      res.send(messages)
    } catch (error) {
      if (error instanceof ValidationError) {
        return next(BadRequest(error.message))
      }
      return next(error)
    }
  }
}

const messageView = (id, labelIds) => {
  return `
SELECT DISTINCT m.id,
       m.owner,
       (SELECT json_group_array(json_object('id', cast(lbl.label_id AS INTEGER), 'name', lbl.label))
        FROM fts_message_label AS lbl
        WHERE cast(m.id AS BLOB) = cast(lbl.message_id AS BLOB)
        --AND lbl.owner = m.owner
        --AND lbl.owner = $1
           ) AS labels,
       subject,
       snippet,
       --mimetype,
       --body_uri,
       "from",
       "to",
       tags--,
       --timeline_id,
       -- convert Integer(4) (treating it as Unix-Time)
       -- to YYYY-MM-DD HH:MM:SS
       --DateTime(timestamp, 'unixepoch') AS timestamp
FROM message m INNER JOIN fts_message_label flbl
                          ON m.id = flbl.message_id --AND
                             --flbl.owner = $1
WHERE m.owner = $1 AND
    ${id !== null ? 'cast(m.id AS BLOB) = cast($2 AS BLOB) AND' : ''}
    ${labelIds !== null ? `(${labelIds.map((labelId, i) => `cast(flbl.label_id AS BLOB) = cast($${i + 2} AS BLOB)`).join(' OR ')}) AND` : ''}
    m.last_stmt < 2
ORDER BY m.timeline_id DESC
--LIMIT 2
;
`
}
