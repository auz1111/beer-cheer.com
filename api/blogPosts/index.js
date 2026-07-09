const { getCosmosContainers } = require("../shared/cosmos")
const { json } = require("../shared/response")

module.exports = async function (context) {
  try {
    const { posts } = await getCosmosContainers()

    const { resources } = await posts.items
      .query({
        query: "SELECT c.id, c.title, c.slug, c.excerpt, c.content, c.publishedAt FROM c WHERE c.type = @type ORDER BY c.publishedAt DESC",
        parameters: [{ name: "@type", value: "post" }]
      })
      .fetchAll()

    return json(context, 200, { posts: resources })
  } catch (error) {
    context.log.error("Failed to fetch blog posts", error)
    return json(context, 500, { message: "Failed to load posts" })
  }
}
