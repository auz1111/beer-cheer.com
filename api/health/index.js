const { getCosmosContainers } = require("../shared/cosmos")
const { json } = require("../shared/response")

module.exports = async function (context) {
  const payload = {
    status: "ok",
    service: "beer-cheer-api",
    time: new Date().toISOString(),
    checks: {
      cosmosConfigured: Boolean(process.env.COSMOS_ENDPOINT && process.env.COSMOS_KEY),
      cosmosReachable: false
    }
  }

  if (!payload.checks.cosmosConfigured) {
    payload.status = "degraded"
    return json(context, 200, payload)
  }

  try {
    await getCosmosContainers()
    payload.checks.cosmosReachable = true
    return json(context, 200, payload)
  } catch (error) {
    context.log.warn("Health check cosmos probe failed", error?.message || error)
    payload.status = "degraded"
    return json(context, 200, payload)
  }
}
