'use client'

import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import { FilePreview } from '@/components/FilePreview'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface File {
  id: number
  filename: string
  path: string
  createdAt: string
}

export default function Home() {
  const [currentPath, setCurrentPath] = useState('/')
  const [files, setFiles] = useState<File[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    // Cargar archivos del localStorage al iniciar
    const savedFiles = localStorage.getItem('uploadedFiles')
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles))
    }
  }, [])

  const handleFileUploaded = (file: { filename: string, path: string }) => {
    const newFile: File = {
      id: Date.now(),
      filename: file.filename,
      path: file.path,
      createdAt: new Date().toISOString(),
    }
    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    // Guardar archivos en localStorage
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles))
  }

  const sortedAndFilteredFiles = files
    .filter(file => {
      if (filterType === 'all') return true
      const fileExt = file.filename.split('.').pop()?.toLowerCase()
      switch (filterType) {
        case 'images': return ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')
        case 'videos': return ['mp4', 'webm'].includes(fileExt || '')
        case 'documents': return ['pdf', 'doc', 'docx', 'txt'].includes(fileExt || '')
        default: return true
      }
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.filename.localeCompare(b.filename)
          : b.filename.localeCompare(a.filename)
      } else {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mi Nube Personal</h1>
      
      <FileUpload
        currentPath={currentPath}
        userId={1}
        onFileUploaded={handleFileUploaded}
      />

      <div className="my-4 flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'date')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="date">Fecha</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
        </Button>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="images">Imágenes</SelectItem>
            <SelectItem value="videos">Videos</SelectItem>
            <SelectItem value="documents">Documentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedAndFilteredFiles.map((file) => (
          <FilePreview key={file.id} file={file} />
        ))}
      </div>
    </div>
  )
}