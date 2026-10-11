import { describe, it, expect } from 'vitest'
import { middleware } from './middleware'
import { makeRequest } from '@/tests/helpers/auth'

describe('middleware', () => {
  it('returns 401 for an API route with no token', async () => {
    // Arrange: a request with no cookies at all
    const req = makeRequest('/api/drivers/ride')

    // Act
    const res = await middleware(req)

    // Assert
    expect(res.status).toBe(401)
  })
})