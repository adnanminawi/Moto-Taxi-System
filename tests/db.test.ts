import { describe, it, expect } from 'vitest'
import db from '@/lib/db'
import { RowDataPacket } from 'mysql2'

describe('test database', () => {
  it('connects to the moto_test database', async () => {
    // Act
    const [rows] = await db.query<RowDataPacket[]>('SELECT DATABASE() AS name')

    // Assert
    expect(rows[0].name).toBe('moto_test')
  })
})