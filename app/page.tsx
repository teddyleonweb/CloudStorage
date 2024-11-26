// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import { FilePreview } from '@/components/FilePreview'
import { Button } from "@/components/ui/button"
import Register from '@/components/Register'
import Login from '@/components/Login'

interface File {
  id: number
  filename: string
  path: string
  createdAt: string
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      fetchFiles()
    }
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      } else {
        console.error('Failed to fetch files')
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const handleFilesUploaded = () => {
    fetchFiles()
  }

  const handleDeleteFile = async (id: number) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        setFiles(files.filter(file => file.id !== id))
      } else {
        console.error('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setFiles([])
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Nube</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Register</h2>
            <Register />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Login</h2>
            <Login />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Nube</h1>
      <Button onClick={handleLogout} className="mb-4">Logout</Button>
      <FileUpload currentPath="/" onFilesUploaded={handleFilesUploaded} />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Your Files</h2>
        {files.map(file => (
          <FilePreview
            key={file.id}
            file={file}
            onDelete={() => handleDeleteFile(file.id)}
            onRename={() => {}} // Implement rename functionality if needed
            isSelected={false}
            onSelect={() => {}} // Implement select functionality if needed
          />
        ))}
      </div>
    </div>
  )
}