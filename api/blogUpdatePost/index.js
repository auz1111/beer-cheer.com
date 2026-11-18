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

  const { id, title, excerpt, content, status } = req.body || {}

  if (status !== undefined && status !== "draft" && status !== "publish") {
    return json(context, 400, { message: "status must be draft or publish" })
  }

  if (!id || !title || !content) {
    return json(context, 400, { message: "id, title and content are required" })
  }

  try {
    const { posts } = await getCosmosContainers()

    const { resource: existingPost } = await posts.item(String(id), "post").read()

    if (!existingPost) {
      return json(context, 404, { message: "Post not found" })
    }

    const updatedPost = {
      ...existingPost,
      title: String(title).trim(),
      // Archived (sectioned) posts keep their imported slug so their URLs don't change.
      slug: existingPost.section
        ? existingPost.slug
        : slugify(title) || existingPost.slug || String(id),
      ...(status !== undefined ? { status } : {}),
      excerpt: String(excerpt || "").trim(),
      content: String(content).trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.role
    }

    await posts.items.upsert(updatedPost)

    return json(context, 200, { post: updatedPost })
  } catch (error) {
    context.log.error("Failed to update blog post", error)
    return json(context, 500, { message: "Failed to update post" })
  }
}
