'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  currentPath: string
  userId: number
  onFileUploaded: (file: { filename: string, path: string }) => void
}

export default function FileUpload({ currentPath, userId, onFileUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setUploadStatus('Iniciando carga de archivos...')
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        setUploadStatus(`Subiendo ${file.name}...`)
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        if (data.success) {
          setUploadStatus(`${file.name} subido exitosamente`)
          console.log(`File uploaded successfully: ${data.filePath}`)
          onFileUploaded({
            filename: file.name,
            path: data.filePath
          })
        } else {
          setUploadStatus(`Error al subir ${file.name}: ${data.message}`)
          console.error('Upload failed:', data.message)
        }
      } catch (error) {
        setUploadStatus(`Error al subir ${file.name}: ${error}`)
        console.error('Error uploading file:', error)
      }
    }
    setIsUploading(false)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
      />
      {isUploading ? (
        <p>{uploadStatus}</p>
      ) : (
        <p>{isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}</p>
      )}
    </div>
  )
}