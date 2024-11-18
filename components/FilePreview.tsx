'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { File, Image, Video, X } from 'lucide-react'

interface FilePreviewProps {
  file: {
    filename: string
    path: string
  }
}

export function FilePreview({ file }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fileType = file.filename.split('.').pop()?.toLowerCase()

  const getIcon = () => {
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-6 h-6" />
      case 'mp4':
      case 'webm':
        return <Video className="w-6 h-6" />
      default:
        return <File className="w-6 h-6" />
    }
  }

  const renderThumbnail = () => {
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <img src={file.path} alt={file.filename} className="w-full h-32 object-cover rounded-t-lg" />
      case 'mp4':
      case 'webm':
        return (
          <video className="w-full h-32 object-cover rounded-t-lg">
            <source src={file.path} type={`video/${fileType}`} />
            Your browser does not support the video tag.
          </video>
        )
      default:
        return <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-t-lg">{getIcon()}</div>
    }
  }

  const renderPreview = () => {
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <img src={file.path} alt={file.filename} className="max-w-full max-h-[80vh]" />
      case 'mp4':
      case 'webm':
        return (
          <video controls className="max-w-full max-h-[80vh]">
            <source src={file.path} type={`video/${fileType}`} />
            Your browser does not support the video tag.
          </video>
        )
      default:
        return <p>No preview available for {file.filename}</p>
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="w-full text-left">
              {renderThumbnail()}
              <div className="p-4">
                <p className="text-sm font-medium truncate">{file.filename}</p>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>{file.filename}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex justify-center">
              {renderPreview()}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}