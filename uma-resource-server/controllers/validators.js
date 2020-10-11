const Joi = require('joi')

const attachmentSchema = {
  id: Joi.number().integer().required(),
  // name: Joi.string().guid({version: 'uuidv4'}).required(),
  filename: Joi.string(),
  destination: Joi.string(),
  mimetype: Joi.string(),
  encoding: Joi.string(),
  size: Joi.number().integer()
}

exports.validateAttachments = (message) => {
  const schema = Joi.array().items(attachmentSchema).required()

  const result = Joi.validate(message, schema)
  // console.log(JSON.stringify(result, null, 2));
  return result
}
