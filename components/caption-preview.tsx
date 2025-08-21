"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { downloadCaption, type Caption, type CaptionTrack } from "@/lib/youtube-api"

interface CaptionPreviewProps {
  videoId: string
  caption: Caption
  className?: string
}

export function CaptionPreview({ videoId, caption, className }: CaptionPreviewProps) {
  const [captionTrack, setCaptionTrack] = useState<CaptionTrack | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const loadPreview = async () => {
    if (!videoId || !caption) return

    setIsLoading(true)
    setError(null)

    try {
      const track = await downloadCaption(videoId, caption.id, "txt")
      if (track) {
        setCaptionTrack(track)
        setShowPreview(true)
      } else {
        setError("Failed to load caption preview")
      }
    } catch (err) {
      setError("Failed to load caption preview")
      console.error("Error loading caption preview:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPreviewText = (content: string): string => {
    const words = content.split(" ")
    return words.slice(0, 50).join(" ") + (words.length > 50 ? "..." : "")
  }

  if (!showPreview) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Caption Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Button onClick={loadPreview} disabled={isLoading} variant="outline">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading Preview...
                </div>
              ) : (
                "Load Preview"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          Caption Preview
          <Badge variant="secondary" className="text-xs">
            {caption.language}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {captionTrack && !isLoading && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Preview of caption content (first 50 words):</div>
            <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
              {getPreviewText(captionTrack.content)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Language: {captionTrack.language}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Format: {captionTrack.format.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
