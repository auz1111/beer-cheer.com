const jwt = require("jsonwebtoken")
const { json } = require("./response")

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || "local-dev-secret-change-me"
}

function signAdminToken() {
  return jwt.sign({ role: "admin" }, getJwtSecret(), {
    expiresIn: "7d"
  })
}

function requireAdmin(context, req) {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    json(context, 401, { message: "Missing bearer token" })
    return null
  }

  const token = authHeader.slice("Bearer ".length)

  try {
    const decoded = jwt.verify(token, getJwtSecret())
    if (decoded.role !== "admin") {
      json(context, 403, { message: "Forbidden" })
      return null
    }

    return decoded
  } catch {
    json(context, 401, { message: "Invalid token" })
    return null
  }
}

function isAdminPasswordValid(password) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return false
  }
  return password === expected
}

module.exports = {
  signAdminToken,
  requireAdmin,
  isAdminPasswordValid
}
