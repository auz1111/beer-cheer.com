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
  const customToken = req.headers['x-admin-token'] || req.headers['X-Admin-Token']
  if (customToken) {
    try {
      const decoded = jwt.verify(customToken, getJwtSecret())
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

// Like requireAdmin, but never writes a response: returns the decoded admin token or null.
function getAdmin(req) {
  const headers = (req && req.headers) || {}
  const customToken = headers['x-admin-token'] || headers['X-Admin-Token']
  const authHeader = headers.authorization || headers.Authorization || ''
  const token = customToken || (authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : '')

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret())
    return decoded.role === "admin" ? decoded : null
  } catch {
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
  getAdmin,
  isAdminPasswordValid
}
