function json(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json"
    },
    body
  }
}

function noContent(context) {
  context.res = {
    status: 204,
    body: null
  }
}

module.exports = {
  json,
  noContent
}
