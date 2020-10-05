const { DataTypes, Model } = require('sequelize')
const sequelize = require('config/sequelize')

class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  owner: {
    type: DataTypes.STRING
  },
  subject: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  freezeTableName: true,
  tableName: 'message'
})

module.exports = Message
