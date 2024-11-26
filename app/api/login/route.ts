import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const db = await openDb()

  try {
    const user = await db.getUser(username)

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ message: 'Error logging in', error: (error as Error).message }, { status: 500 })
  }
}