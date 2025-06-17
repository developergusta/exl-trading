"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, Download, ExternalLink } from "lucide-react"
import type { Database } from "@/lib/supabase"

type CourseContent = Database["public"]["Tables"]["course_content"]["Row"]

interface ContentItemProps {
  content: CourseContent
}

export function ContentItem({ content }: ContentItemProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const getContentIcon = () => {
    switch (content.content_type) {
      case "youtube":
        return <Play className="w-5 h-5" />
      case "pdf":
        return <FileText className="w-5 h-5" />
      case "download":
        return <Download className="w-5 h-5" />
      default:
        return <ExternalLink className="w-5 h-5" />
    }
  }

  const getContentTypeLabel = () => {
    switch (content.content_type) {
      case "youtube":
        return "Vídeo"
      case "pdf":
        return "PDF"
      case "download":
        return "Download"
      default:
        return "Link"
    }
  }

  const renderContent = () => {
    switch (content.content_type) {
      case "youtube":
        const embedUrl = getYouTubeEmbedUrl(content.content_url)
        if (embedUrl) {
          return (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                title={content.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )
        }
        return (
          <div className="aspect-video bg-[#2A2B2A] rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">URL do YouTube inválida</p>
              <Button
                onClick={() => window.open(content.content_url, "_blank")}
                className="mt-4 bg-[#BBF717] text-black hover:bg-[#9FD615]"
              >
                Abrir Link Original
              </Button>
            </div>
          </div>
        )

      case "pdf":
        return (
          <div className="bg-[#2A2B2A] rounded-lg p-8">
            <div className="text-center">
              <FileText className="w-16 h-16 text-[#BBF717] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Documento PDF</h3>
              <p className="text-gray-400 mb-6">Clique no botão abaixo para visualizar o PDF</p>
              <Button
                onClick={() => window.open(content.content_url, "_blank")}
                className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir PDF
              </Button>
            </div>
          </div>
        )

      case "download":
        return (
          <div className="bg-[#2A2B2A] rounded-lg p-8">
            <div className="text-center">
              <Download className="w-16 h-16 text-[#BBF717] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Arquivo para Download</h3>
              <p className="text-gray-400 mb-6">Baixe o arquivo para acessar o conteúdo</p>
              <Button
                onClick={() => window.open(content.content_url, "_blank")}
                className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-[#2A2B2A] rounded-lg p-8">
            <div className="text-center">
              <ExternalLink className="w-16 h-16 text-[#BBF717] mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Link Externo</h3>
              <p className="text-gray-400 mb-6">Acesse o conteúdo através do link</p>
              <Button
                onClick={() => window.open(content.content_url, "_blank")}
                className="bg-[#BBF717] text-black hover:bg-[#9FD615]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Link
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getContentIcon()}
              <Badge variant="secondary" className="bg-[#BBF717] text-black">
                {getContentTypeLabel()}
              </Badge>
            </div>
            <CardTitle className="text-white">{content.title}</CardTitle>
            {content.description && <p className="text-gray-400 mt-2">{content.description}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {content.cover_url && (
          <div className="mb-6">
            <img
              src={content.cover_url || "/placeholder.svg"}
              alt={content.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        {renderContent()}
      </CardContent>
    </Card>
  )
}
