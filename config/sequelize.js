const { Sequelize } = require('sequelize')
const { logger } = require('utils')

const sequelize = new Sequelize(
  process.env.DATABASE_SCHEMA,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    logging: process.env.LOG_LEVEL && process.env.LOG_LEVEL.toLowerCase() === 'debug' ? log => logger.debug(log) : false,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    pool: {
      acquire: 300000, // 5 minutes
      max: parseInt(process.env.DATABASE_MAX_POOL_CONNECTIONS) || 50
    },
    dialect: 'mariadb'
  }
)
module.exports = sequelize
