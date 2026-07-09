const { json } = require("../shared/response")
const { signAdminToken, isAdminPasswordValid } = require("../shared/auth")

module.exports = async function (context, req) {
  const { username, password } = req.body || {}
  const expectedUsername = process.env.ADMIN_USERNAME || "admin"
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return json(context, 400, { message: "username and password are required" })
  }

  if (!expectedPassword) {
    return json(context, 503, { message: "Admin login is not configured on the server" })
  }

  if (username !== expectedUsername || !isAdminPasswordValid(password)) {
    return json(context, 401, { message: "Invalid credentials" })
  }

  const token = signAdminToken()
  return json(context, 200, {
    token,
    admin: {
      username: expectedUsername
    }
  })
}
