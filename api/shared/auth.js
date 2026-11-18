const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { json } = require("./response")

const JWT_ALGORITHM = "HS256"

// No fallback: if JWT_SECRET is missing, admin auth is disabled rather than signed with a guessable key.
function getJwtSecret() {
  return process.env.JWT_SECRET || null
}

function signAdminToken() {
  const secret = getJwtSecret()
  if (!secret) {
    return null
  }
  return jwt.sign({ role: "admin" }, secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "7d"
  })
}

function getRequestToken(req) {
  const customToken = req.headers["x-admin-token"] || req.headers["X-Admin-Token"]
  if (customToken) {
    return customToken
  }

  const authHeader = req.headers.authorization || req.headers.Authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length)
  }

  return null
}

function requireAdmin(context, req) {
  const secret = getJwtSecret()
  if (!secret) {
    json(context, 503, { message: "Admin auth is not configured on the server" })
    return null
  }

  const token = getRequestToken(req)
  if (!token) {
    json(context, 401, { message: "Missing bearer token" })
    return null
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] })
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

function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest()
  const hashB = crypto.createHash("sha256").update(String(b)).digest()
  return crypto.timingSafeEqual(hashA, hashB)
}

function isAdminPasswordValid(password) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return false
  }
  return safeEqual(password, expected)
}

module.exports = {
  signAdminToken,
  requireAdmin,
  isAdminPasswordValid,
  safeEqual
}
