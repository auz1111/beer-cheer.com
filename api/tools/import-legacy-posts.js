/* eslint-disable no-console */
const { CosmosClient } = require('@azure/cosmos')

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

async function fetchLegacyPosts() {
  const url = 'https://beercheer.wpengine.com/wp-json/wp/v2/posts?per_page=100&orderby=date&order=asc&_fields=id,date,date_gmt,slug,link,title,excerpt,content'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch legacy posts: ${response.status}`)
  }

  return response.json()
}

async function main() {
  const endpoint = required('COSMOS_ENDPOINT')
  const key = required('COSMOS_KEY')
  const databaseId = process.env.COSMOS_DATABASE || 'beercheer'
  const containerId = process.env.COSMOS_POSTS_CONTAINER || 'posts'

  const client = new CosmosClient({ endpoint, key })
  const { database } = await client.databases.createIfNotExists({ id: databaseId })
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: {
      kind: 'Hash',
      paths: ['/type'],
    },
  })

  const posts = await fetchLegacyPosts()
  console.log(`Fetched ${posts.length} posts from legacy site`)

  let upserted = 0

  for (const post of posts) {
    const publishedAt = post.date_gmt ? `${post.date_gmt}Z` : post.date

    const doc = {
      id: `wp-${post.id}`,
      type: 'post',
      source: 'legacy-wordpress',
      legacy: true,
      wpId: post.id,
      title: post.title?.rendered || '',
      slug: post.slug || `wp-${post.id}`,
      excerpt: post.excerpt?.rendered || '',
      content: post.content?.rendered || '',
      publishedAt,
      legacyLink: post.link || '',
      importedAt: new Date().toISOString(),
    }

    await container.items.upsert(doc)
    upserted += 1
    console.log(`Upserted ${doc.slug}`)
  }

  console.log(`Done. Upserted ${upserted} posts into ${databaseId}/${containerId}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
