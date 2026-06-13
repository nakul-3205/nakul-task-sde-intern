const API_BASE ="https://sde-intern-task-api.nakulkejriwal124.workers.dev"
// import.meta.env.VITE_API_URL
// console.log(API_BASE)

type Json =
  | Record<string, unknown>
  | unknown[]
  | null

function buildUrl(path: string) {
  return `${API_BASE}${path}`
}

async function refreshAccess() {
  try {
    const res = await fetch(
      buildUrl('/auth/refresh'),
      {
        method: 'POST',
        credentials: 'include',
      },
    )
    return res.ok
  } catch (err) {
    console.error('Token refresh failed:', err)
    return false
  }
}

export async function api<T>(
  path: string,
  opts: {
    method?: string
    body?: Json
  } = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
  } = opts

  let res = await fetch(
    buildUrl(path),
    {
      method,
      credentials: 'include',
      headers: {
        'Content-Type':
          'application/json',
      },
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    },
  )

  // If unauthorized, try to refresh token
  if (res.status === 401) {
    const refreshed = await refreshAccess()

    if (refreshed) {
      // Retry the original request after refresh
      res = await fetch(
        buildUrl(path),
        {
          method,
          credentials: 'include',
          headers: {
            'Content-Type':
              'application/json',
          },
          body:
            body !== undefined
              ? JSON.stringify(body)
              : undefined,
        },
      )
    }
  }

  let json: any
  try {
    json = await res.json()
  } catch {
    // If response isn't JSON, throw based on status
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return undefined as T
  }

  if (
    !res.ok ||
    json.success === false
  ) {
    throw new Error(
      json.error ||
        json.message ||
        'Request failed',
    )
  }

  return json.data
}