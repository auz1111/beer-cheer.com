const crypto = require("node:crypto")
const { getCosmosContainers } = require("../shared/cosmos")
const { json } = require("../shared/response")
const { requireAdmin } = require("../shared/auth")

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

module.exports = async function (context, req) {
  const user = requireAdmin(context, req)
  if (!user) {
    return
  }

  const { title, excerpt, content } = req.body || {}

  if (!title || !content) {
    return json(context, 400, { message: "title and content are required" })
  }

  const id = crypto.randomUUID()
  const publishedAt = new Date().toISOString()
  const slug = slugify(title)

  try {
    const { posts } = await getCosmosContainers()

    const document = {
      id,
      type: "post",
      title: String(title).trim(),
      slug: slug || id,
      excerpt: String(excerpt || "").trim(),
      content: String(content).trim(),
      publishedAt,
      createdBy: user.role
    }

    await posts.items.create(document)

    return json(context, 201, { post: document })
  } catch (error) {
    context.log.error("Failed to create blog post", error)
    return json(context, 500, { message: "Failed to create post" })
  }
}
