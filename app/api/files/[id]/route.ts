import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '../../../../lib/db'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ message: 'No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const userId = decoded.userId

    const { id } = params

    const db = await openDb()
    const files = await db.getFiles(userId)
    const file = files.find(f => f.id === parseInt(id))

    if (!file) {
      return NextResponse.json({ message: 'File not found or you do not have permission to delete it' }, { status: 404 })
    }

    await db.deleteFile(parseInt(id))

    const filePath = path.join(process.cwd(), 'public', file.path)
    await fs.unlink(filePath)

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ message: 'Error deleting file' }, { status: 500 })
  }
}