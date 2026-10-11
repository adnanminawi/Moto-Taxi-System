import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET!

// A valid token, signed exactly like the login routes do
export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' })
}

// Signed with the WRONG secret: what an attacker forging a token would have
export function signTamperedToken(payload: object) {
  return jwt.sign(payload, 'not-the-real-secret', { expiresIn: '1h' })
}

// Expired one minute ago
export function signExpiredToken(payload: object) {
  return jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET)
}

// A request to `path`, carrying the given cookies
export function makeRequest(path: string, cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
  return new NextRequest(`http://localhost${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  })
}