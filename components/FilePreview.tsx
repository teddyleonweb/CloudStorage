'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { File, ImageIcon, Video, Trash, Edit2, Play, X } from 'lucide-react'

interface FilePreviewProps {
  file: {
    id: number
    filename: string
    path: string
  }
  onDelete: (id: number) => void
  onRename: (id: number, newName: string) => void
  isSelected: boolean
  onSelect: (id: number) => void
}

export function FilePreview({ file, onDelete, onRename, isSelected, onSelect }: FilePreviewProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(file.filename)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const fileType = file.filename.split('.').pop()?.toLowerCase()

  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '')
  const isVideo = ['mp4', 'webm', 'ogg'].includes(fileType || '')

  useEffect(() => {
    if (isVideo) {
      generateVideoThumbnail()
    }
  }, [file.path, isVideo])

  const generateVideoThumbnail = () => {
    const video = document.createElement('video')
    video.src = file.path
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      video.currentTime = 1 // Seek to 1 second
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
      setVideoThumbnail(canvas.toDataURL())
    }
  }

  const getIcon = () => {
    if (isImage) return <ImageIcon className="w-6 h-6" />
    if (isVideo) return <Video className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const handleRename = () => {
    if (newName.trim() && newName !== file.filename) {
      onRename(file.id, newName)
    }
    setIsRenaming(false)
  }

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="relative w-full h-32 cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          <Image
            src={file.path}
            alt={file.filename}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
          />
        </div>
      )
    }
    if (isVideo) {
      return (
        <div className="relative w-full h-32 bg-gray-200 flex items-center justify-center rounded-t-lg cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
          {videoThumbnail ? (
            <Image
              src={videoThumbnail}
              alt={file.filename}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg"
            />
          ) : (
            <Play className="w-12 h-12 text-gray-500" />
          )}
        </div>
      )
    }
    return (
      <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-t-lg">
        {getIcon()}
      </div>
    )
  }

  const renderFullPreview = () => {
    if (isImage) {
      return (
        <div className="relative w-full h-full max-h-[80vh]">
          <Image
            src={file.path}
            alt={file.filename}
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      )
    }
    if (isVideo) {
      return (
        <video controls className="w-full max-h-[80vh]">
          <source src={file.path} type={`video/${fileType}`} />
          Your browser does not support the video tag.
        </video>
      )
    }
    return null
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {renderPreview()}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              {getIcon()}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(file.id)}
                aria-label={`Select ${file.filename}`}
              />
            </div>
            {isRenaming ? (
              <div className="flex items-center">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mr-2"
                />
                <Button onClick={handleRename} size="sm">Save</Button>
              </div>
            ) : (
              <p className="text-sm font-medium truncate">{file.filename}</p>
            )}
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRenaming(true)}
                className="mr-2"
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Rename file</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(file.id)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete file</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh]">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {renderFullPreview()}
        </DialogContent>
      </Dialog>
    </>
  )
}