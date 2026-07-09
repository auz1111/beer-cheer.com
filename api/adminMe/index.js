const { json } = require("../shared/response")
const { requireAdmin } = require("../shared/auth")

module.exports = async function (context, req) {
  const user = requireAdmin(context, req)
  if (!user) {
    return
  }

  return json(context, 200, {
    authenticated: true,
    role: user.role
  })
}
