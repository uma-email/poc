const { Sequelize } = require('sequelize')
const { logger } = require('utils')

const sequelize = new Sequelize(
  // process.env.DATABASE_SCHEMA,
  // process.env.DATABASE_USER,
  // process.env.DATABASE_PASSWORD,
  {
    logging: process.env.LOG_LEVEL && process.env.LOG_LEVEL.toLowerCase() === 'debug' ? log => logger.debug(log) : false,
    // host: process.env.DATABASE_HOST,
    // port: Number(process.env.DATABASE_PORT || 3306),
    pool: {
      acquire: 300000, // 5 minutes
      idle: 10000, // 10 sec
      min: 0,
      max: parseInt(process.env.DATABASE_MAX_POOL_CONNECTIONS) || 5
    },
    dialect: 'sqlite',
    storage: process.env.DATABASE_SCHEMA,
    define: {
      timestamps: false
    }
  }
)

const initAction = async () => {
  await sequelize.authenticate()
  // await sequelize.drop()
  try {
    await sequelize.sync()
    console.log('Database connected')
  } catch (error) {
    console.error('Error: ', error)
  }
}
initAction()

module.exports = sequelize
