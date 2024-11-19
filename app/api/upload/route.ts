import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  const userId = data.get('userId')
  const currentPath = data.get('currentPath')

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Asegúrate de que esta ruta existe y tiene permisos de escritura
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', userId as string)
  
  try {
    await mkdir(uploadDir, { recursive: true })
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    console.log('File written successfully:', filePath)
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      filePath: `/uploads/${userId}/${fileName}` 
    })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}