/* eslint-disable no-console */
// Imports the Bend Beer Blog archive (WordPress, 2010-2015) into the Beer Cheer posts container.
// Data: api/tools/data/bend-beer-blog.json, generated from the WP Engine backup of bendbeerblog
// (converter + notes: sites/bendbeerblog.md in the Web Sites Hub). Images: public/legacy/bendbeerblog/.
//
//   node tools/import-bend-beer-blog.js --dry-run      # validate only, no Cosmos needed
//   COSMOS_ENDPOINT=... COSMOS_KEY=... node tools/import-bend-beer-blog.js
//
// Upserts by id (bbb-<wpId>), so re-running is safe; it overwrites edits made to those posts in admin.
const fs = require('node:fs')
const path = require('node:path')

const DATA = path.join(__dirname, 'data', 'bend-beer-blog.json')
const REQUIRED = ['id', 'type', 'section', 'kind', 'status', 'title', 'slug', 'content', 'publishedAt']

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function validate(posts) {
  const slugs = new Set()
  const ids = new Set()
  for (const post of posts) {
    for (const key of REQUIRED) {
      if (post[key] === undefined || post[key] === '') {
        throw new Error(`${post.id || '(no id)'} is missing ${key}`)
      }
    }
    if (post.type !== 'post' || post.section !== 'bend-beer-blog') {
      throw new Error(`${post.id} has unexpected type/section`)
    }
    if (Number.isNaN(Date.parse(post.publishedAt))) {
      throw new Error(`${post.id} has a bad publishedAt: ${post.publishedAt}`)
    }
    if (ids.has(post.id) || slugs.has(post.slug)) {
      throw new Error(`Duplicate id or slug: ${post.id} / ${post.slug}`)
    }
    ids.add(post.id)
    slugs.add(post.slug)
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const posts = JSON.parse(fs.readFileSync(DATA, 'utf8'))
  validate(posts)

  const counts = {}
  for (const post of posts) {
    const key = `${post.kind}/${post.status}`
    counts[key] = (counts[key] || 0) + 1
  }
  console.log(`${posts.length} posts valid:`, counts)

  if (dryRun) {
    console.log('Dry run: nothing written.')
    return
  }

  const { CosmosClient } = require('@azure/cosmos')
  const client = new CosmosClient({ endpoint: required('COSMOS_ENDPOINT'), key: required('COSMOS_KEY') })
  const databaseId = process.env.COSMOS_DATABASE || 'beercheer'
  const containerId = process.env.COSMOS_POSTS_CONTAINER || 'posts'
  const container = client.database(databaseId).container(containerId)

  const importedAt = new Date().toISOString()
  let upserted = 0
  for (const post of posts) {
    await container.items.upsert({ ...post, importedAt })
    upserted += 1
    console.log(`Upserted ${post.id} ${post.slug}`)
  }

  console.log(`Done. Upserted ${upserted} posts into ${databaseId}/${containerId}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
