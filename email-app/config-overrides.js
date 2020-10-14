const rewireReactHotLoader = require('react-app-rewire-hot-loader')

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env) // eslint-disable-line
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-dom': '@hot-loader/react-dom',
    },
  }

  return config
}
