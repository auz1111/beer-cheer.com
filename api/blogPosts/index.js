const { getCosmosContainers } = require("../shared/cosmos")
const { json } = require("../shared/response")
const { getAdmin } = require("../shared/auth")

// Sections are archives of other blogs imported into Beer Cheer (e.g. "bend-beer-blog").
// Without ?section= the main Beer Cheer feed is returned (posts that have no section).
// Drafts are only returned to an admin (Bearer / x-admin-token).
const SECTION_PATTERN = /^[a-z0-9-]{1,64}$/

const FIELDS = [
  "c.id", "c.title", "c.slug", "c.excerpt", "c.content", "c.publishedAt",
  "c.section", "c.kind", "c.status", "c.comments"
].join(", ")

module.exports = async function (context, req) {
  const query = (req && req.query) || {}
  const section = query.section ? String(query.section) : ""
  const isAdmin = Boolean(getAdmin(req))
  // Admins may ask for every post in every section (admin blog list).
  const all = isAdmin && query.all === "1"

  if (section && !SECTION_PATTERN.test(section)) {
    return json(context, 400, { message: "Invalid section" })
  }

  const where = ["c.type = @type"]
  const parameters = [{ name: "@type", value: "post" }]

  if (!all) {
    if (section) {
      where.push("c.section = @section")
      parameters.push({ name: "@section", value: section })
    } else {
      where.push("(NOT IS_DEFINED(c.section) OR IS_NULL(c.section))")
    }
  }

  if (!isAdmin) {
    where.push("(NOT IS_DEFINED(c.status) OR c.status != 'draft')")
  }

  try {
    const { posts } = await getCosmosContainers()

    const { resources } = await posts.items
      .query({
        query: `SELECT ${FIELDS} FROM c WHERE ${where.join(" AND ")} ORDER BY c.publishedAt DESC`,
        parameters
      })
      .fetchAll()

    return json(context, 200, { posts: resources })
  } catch (error) {
    context.log.error("Failed to fetch blog posts", error)
    return json(context, 500, { message: "Failed to load posts" })
  }
}
