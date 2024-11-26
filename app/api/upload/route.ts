import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import jwt from 'jsonwebtoken'
import { openDb } from '../../../lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    const userId = decoded.userId

    const data = await req.formData()
    const file = data.get('file') as File | null
    const currentPath = data.get('currentPath') as string

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', userId.toString())

    try {
      await mkdir(uploadDir, { recursive: true })
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      const db = await openDb()
      await db.createFile({
        userId,
        filename: file.name,
        path: `/uploads/${userId}/${fileName}`,
        createdAt: new Date().toISOString()
      })

      return NextResponse.json({ 
        success: true, 
        message: 'File uploaded successfully',
        filePath: `/uploads/${userId}/${fileName}` 
      })
    } catch (error) {
      console.error('Error saving file:', error)
      return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}