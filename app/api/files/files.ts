import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '../../../lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const userId = decoded.userId

    const db = await openDb()
    const files = await db.all('SELECT * FROM files WHERE userId = ?', [userId])

    return NextResponse.json({ files })
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}