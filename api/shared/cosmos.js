const { CosmosClient } = require("@azure/cosmos")

let cached

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function getCosmosContainers() {
  if (cached) {
    return cached
  }

  const endpoint = required("COSMOS_ENDPOINT")
  const key = required("COSMOS_KEY")
  const databaseId = process.env.COSMOS_DATABASE || "beercheer"
  const postsContainerId = process.env.COSMOS_POSTS_CONTAINER || "posts"

  const client = new CosmosClient({ endpoint, key })
  const { database } = await client.databases.createIfNotExists({ id: databaseId })

  const { container: posts } = await database.containers.createIfNotExists({
    id: postsContainerId,
    partitionKey: {
      kind: "Hash",
      paths: ["/type"]
    }
  })

  cached = { posts }
  return cached
}

module.exports = {
  getCosmosContainers
}
