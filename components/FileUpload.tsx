'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  currentPath: string
  userId: number
  onFilesUploaded: (files: { filename: string, path: string }[]) => void
}

export default function FileUpload({ currentPath, userId, onFilesUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
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

  const uploadFile = async (file: File): Promise<{ filename: string, path: string } | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId.toString())
    formData.append('currentPath', currentPath)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log(`File uploaded successfully: ${data.filePath}`)
        return { filename: file.name, path: data.filePath }
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error)
      return null
    }
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setCurrentFileIndex(0)
    setTotalFiles(files.length)

    const uploadedFiles = []
    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i + 1)
      const result = await uploadFile(files[i])
      if (result) {
        uploadedFiles.push(result)
      }
      setUploadProgress(((i + 1) / files.length) * 100)
    }

    setIsUploading(false)
    onFilesUploaded(uploadedFiles)
    alert(`Subida completada. ${uploadedFiles.length} de ${files.length} archivos subidos exitosamente.`)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
      />
      {isUploading ? (
        <div>
          <p>Subiendo archivo {currentFileIndex} de {totalFiles}...</p>
          <p>Progreso total: {Math.round(uploadProgress)}%</p>
          <Progress value={uploadProgress} className="w-full mt-2" />
        </div>
      ) : (
        <>
          <p>{isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí, o haz clic para seleccionar'}</p>
          <Button onClick={() => fileInputRef.current?.click()} className="mt-2">
            Seleccionar archivos
          </Button>
        </>
      )}
    </div>
  )
}