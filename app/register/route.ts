import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '../../lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const db = await openDb()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword])
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user', error: (error as Error).message }, { status: 500 })
  }
}