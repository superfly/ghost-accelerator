export async function get(key) {
  let meta = await fly.cache.getString(key + ":meta")
  if (!meta) return // cache miss
  try {
    meta = JSON.parse(meta)
  } catch (err) {
    return // also a miss
  }

  let body = await fly.cache.get(key + ":body")
  if (!body) return // miss
  return new Response(body, meta)
}

const goodHeaders = ['content-type', 'content-length', 'cache-control', 'expires', 'content-encoding']
export async function set(key, response, ttl) {
  let meta = {
    status: response.status,
    headers: {}
  }
  for (const h of goodHeaders) {
    const v = response.headers.get(h)
    if (v) {
      meta.headers[h] = v
    }
  }

  const body = await response.clone().arrayBuffer()
  const result = Promise.all([
    fly.cache.set(key + ":meta", JSON.stringify(meta), ttl),
    fly.cache.set(key + ":body", body, ttl)
  ])

  return result[0] && result[1]
}

export default {
  get,
  set
}