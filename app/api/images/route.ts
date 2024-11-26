import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Decode the URL components to handle spaces and special characters
    const decodedPath = params.path.map(segment => decodeURIComponent(segment))
    const filePath = join(process.cwd(), 'uploads', ...decodedPath)

    console.log('Attempting to serve file:', filePath)

    if (!existsSync(filePath)) {
      console.log('File not found:', filePath)
      return new NextResponse('Not Found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const contentType = getContentType(filePath)

    console.log('Serving file with content type:', contentType)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}