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
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.fn('NOW'),
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.fn('NOW'),
    onUpdate: sequelize.fn('NOW'),
    allowNull: false
  }
}, {
  sequelize,
  freezeTableName: true,
  tableName: 'message',
  createdAt: true,
  updatedAt: true
})

module.exports = Message
