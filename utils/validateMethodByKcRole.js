/**
 * Validate which role the user must have to access the route method
 * @requires keycloak.protect()
 * @param {String[]} roles
 * @param {String[]} methods
 * @returns Boolean
 * @example
 * keycloak.protect(validateMethodByKcRole(['realm:role-foo'], ['POST']))
 */
module.exports = (roles = [], methods = []) => (token, req) => {
  try {
    methods = methods.map(m => m.toUpperCase())
    roles = roles.map(r => r.toLowerCase())

    if (methods.length > 0) {
      if (methods[0] === 'ALL' || methods.includes(req.method)) {
        return token.hasRole('realm:admin') || roles.filter(role => token.hasRole(role)).length === roles.length
      }
    }

    return true
  } catch (e) {
    return false
  }
}
