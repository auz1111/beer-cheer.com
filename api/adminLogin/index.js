const { json } = require("../shared/response")
const { signAdminToken, isAdminPasswordValid } = require("../shared/auth")

module.exports = async function (context, req) {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return json(context, 400, { message: "username and password are required" })
  }

  const expectedUsername = process.env.ADMIN_USERNAME || "admin"

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
