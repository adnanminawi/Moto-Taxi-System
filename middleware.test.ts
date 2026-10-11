import { describe, it, expect } from 'vitest'
import { middleware } from './middleware'
import { makeRequest, signToken, signTamperedToken, signExpiredToken } from '@/tests/helpers/auth'

describe('middleware', () => {
  it('returns 401 for an API route with no token', async () => {
    // Arrange: a request with no cookies at all
    const req = makeRequest('/api/drivers/ride')

    // Act
    const res = await middleware(req)

    // Assert
    expect(res.status).toBe(401)
  })
  it('driver token on admin api route',async()=>{
    const driverToken  = signToken({driverId: 1, role:'driver'})
    const req = makeRequest('/api/admin/drivers',{admin_token: driverToken })

    const res = await middleware(req)

    expect(res.status).toBe(401)
  })
  it('admin token on driver api route',async()=>{
    const adminToken= signToken({adminId: 1, role:'admin'})
    const req = makeRequest('/api/drivers/ride',{driver_token: adminToken})

    const res = await middleware(req)

    expect(res.status).toBe(401)
  })
    it('rejects a token signed with the wrong secret', async () => {
    
    const forgedToken = signTamperedToken({ driverId: 1, role: 'driver' })
    const req = makeRequest('/api/drivers/ride', { driver_token: forgedToken })

    
    const res = await middleware(req)

    expect(res.status).toBe(401)
  })
  it('rejects an expired token', async () => {
    
    const expiredToken = signExpiredToken({ driverId: 1, role: 'driver' })
    const req = makeRequest('/api/drivers/ride', { driver_token: expiredToken })

    
    const res = await middleware(req)

    expect(res.status).toBe(401)
    })

  it('allows a valid driver token on a driver route',async()=>{
    const driverToken = signToken({ driverId: 1, role: 'driver' })
    const req = makeRequest('/api/drivers/ride',{driver_token: driverToken})

    const res = await middleware(req)

    expect(res.headers.get('x-middleware-next')).toBe('1')


  })
})