const ACCESS_KEY = 'folio.access'
const REFRESH_KEY = 'folio.refresh'
const API_BASE = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV ? 'http://localhost:8787' : ''

export const tokens = {
  get access() { return typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null },
  get refresh() { return typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

type Json = Record<string, unknown> | unknown[] | null

function buildUrl(path: string) {
  if (path.startsWith('/') && !path.startsWith('//')) {
    return `${API_BASE}${path}`
  }
  return path
}

async function refreshAccess(): Promise<boolean> {
  const rt = tokens.refresh
  if (!rt) return false
  const r = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })
  if (!r.ok) return false
  const body = await r.json()
  if (!body?.success) return false
  tokens.set(body.data.accessToken)
  return true
}

export async function api<T = any>(
  path: string,
  opts: { method?: string; body?: Json; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = opts
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`

  const init: RequestInit = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  let res = await fetch(buildUrl(path), init)
  if (res.status === 401 && auth && tokens.refresh) {
    const ok = await refreshAccess()
    if (ok) {
      headers.Authorization = `Bearer ${tokens.access}`
      res = await fetch(buildUrl(path), { ...init, headers })
    }
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Request failed (${res.status})`)
  }
  return json.data as T
}

export const isAuthed = () => !!tokens.access
