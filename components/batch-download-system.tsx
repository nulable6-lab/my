"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { downloadCaption, type Caption, type YouTubeVideo } from "@/lib/youtube-api"

interface BatchDownloadSystemProps {
  video: YouTubeVideo
  captions: Caption[]
  className?: string
}

interface BatchDownloadItem {
  caption: Caption
  formats: string[]
  status: "pending" | "downloading" | "completed" | "error"
  progress: number
  error?: string
}

export function BatchDownloadSystem({ video, captions, className }: BatchDownloadSystemProps) {
  const [selectedCaptions, setSelectedCaptions] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["srt"])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadItems, setDownloadItems] = useState<BatchDownloadItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const downloadFile = useCallback((content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const generateFileName = useCallback(
    (caption: Caption, format: string): string => {
      const baseFileName = video.title.replace(/[^a-zA-Z0-9\s-_]/g, "").trim()
      const sanitizedFileName = baseFileName.replace(/\s+/g, "_").substring(0, 100)
      return `${sanitizedFileName}_${caption.language}.${format}`
    },
    [video.title],
  )

  const handleCaptionToggle = useCallback((captionId: string, checked: boolean) => {
    setSelectedCaptions((prev) => (checked ? [...prev, captionId] : prev.filter((id) => id !== captionId)))
  }, [])

  const handleFormatToggle = useCallback((format: string, checked: boolean) => {
    setSelectedFormats((prev) => (checked ? [...prev, format] : prev.filter((f) => f !== format)))
  }, [])

  const handleBatchDownload = useCallback(async () => {
    if (selectedCaptions.length === 0) {
      setError("Please select at least one caption language")
      return
    }

    if (selectedFormats.length === 0) {
      setError("Please select at least one download format")
      return
    }

    setIsDownloading(true)
    setError(null)

    // Initialize download items
    const items: BatchDownloadItem[] = selectedCaptions.map((captionId) => {
      const caption = captions.find((c) => c.id === captionId)!
      return {
        caption,
        formats: selectedFormats,
        status: "pending",
        progress: 0,
      }
    })

    setDownloadItems(items)

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Update status to downloading
        setDownloadItems((prev) =>
          prev.map((prevItem, index) => (index === i ? { ...prevItem, status: "downloading", progress: 0 } : prevItem)),
        )

        try {
          for (let j = 0; j < item.formats.length; j++) {
            const format = item.formats[j] as "srt" | "vtt" | "txt"
            const progress = ((j + 1) / item.formats.length) * 100

            // Update progress
            setDownloadItems((prev) =>
              prev.map((prevItem, index) => (index === i ? { ...prevItem, progress } : prevItem)),
            )

            const captionTrack = await downloadCaption(video.id, item.caption.id, format)

            if (!captionTrack) {
              throw new Error(`Failed to download ${format.toUpperCase()} format`)
            }

            const fileName = generateFileName(item.caption, format)
            const mimeTypes = {
              srt: "text/srt",
              vtt: "text/vtt",
              txt: "text/plain",
            }

            downloadFile(captionTrack.content, fileName, mimeTypes[format])

            // Small delay between downloads
            await new Promise((resolve) => setTimeout(resolve, 300))
          }

          // Mark as completed
          setDownloadItems((prev) =>
            prev.map((prevItem, index) =>
              index === i ? { ...prevItem, status: "completed", progress: 100 } : prevItem,
            ),
          )
        } catch (err) {
          console.error(`Error downloading captions for ${item.caption.language}:`, err)
          setDownloadItems((prev) =>
            prev.map((prevItem, index) =>
              index === i
                ? {
                    ...prevItem,
                    status: "error",
                    progress: 0,
                    error: `Failed to download ${item.caption.language} captions`,
                  }
                : prevItem,
            ),
          )
        }

        // Delay between different languages
        if (i < items.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } catch (err) {
      setError("Batch download process failed. Please try again.")
      console.error("Batch download error:", err)
    } finally {
      setIsDownloading(false)
    }
  }, [selectedCaptions, selectedFormats, captions, video.id, generateFileName, downloadFile])

  const getLanguageDisplayName = (languageCode: string): string => {
    const languageNames: Record<string, string> = {
      en: "English",
      "en-US": "English (US)",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
    }
    return languageNames[languageCode] || languageCode.toUpperCase()
  }

  if (captions.length <= 1) {
    return null // Don't show batch download for single caption
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Batch Download</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Caption Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">Select Caption Languages</Label>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {captions.map((caption) => (
              <div key={caption.id} className="flex items-center space-x-3 p-2 rounded border">
                <Checkbox
                  id={`batch-${caption.id}`}
                  checked={selectedCaptions.includes(caption.id)}
                  onCheckedChange={(checked) => handleCaptionToggle(caption.id, checked as boolean)}
                  disabled={isDownloading}
                />
                <Label htmlFor={`batch-${caption.id}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getLanguageDisplayName(caption.language)}</span>
                    <div className="flex items-center gap-2">
                      {caption.isAutoGenerated && (
                        <Badge variant="outline" className="text-xs">
                          Auto
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {caption.language}
                      </Badge>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">Select Download Formats</Label>
          <div className="flex gap-4">
            {["srt", "vtt", "txt"].map((format) => (
              <div key={format} className="flex items-center space-x-2">
                <Checkbox
                  id={`format-${format}`}
                  checked={selectedFormats.includes(format)}
                  onCheckedChange={(checked) => handleFormatToggle(format, checked as boolean)}
                  disabled={isDownloading}
                />
                <Label htmlFor={`format-${format}`} className="text-sm cursor-pointer">
                  {format.toUpperCase()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Download Progress */}
        {downloadItems.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Download Progress</Label>
            {downloadItems.map((item, index) => (
              <div key={item.caption.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{getLanguageDisplayName(item.caption.language)}</span>
                  <Badge
                    variant={
                      item.status === "completed" ? "default" : item.status === "error" ? "destructive" : "secondary"
                    }
                  >
                    {item.status === "pending" && "Pending"}
                    {item.status === "downloading" && "Downloading..."}
                    {item.status === "completed" && "Completed"}
                    {item.status === "error" && "Error"}
                  </Badge>
                </div>
                <Progress value={item.progress} className="h-2" />
                {item.error && <div className="text-xs text-destructive">{item.error}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Download Button */}
        <Button
          onClick={handleBatchDownload}
          disabled={selectedCaptions.length === 0 || selectedFormats.length === 0 || isDownloading}
          className="w-full"
          size="lg"
        >
          {isDownloading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              Downloading {selectedCaptions.length} Languages...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download {selectedCaptions.length} Languages × {selectedFormats.length} Formats
            </div>
          )}
        </Button>

        {/* Download Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Downloads all selected languages in all selected formats</p>
          <p>• Files are named with language codes for easy identification</p>
          <p>• Total files: {selectedCaptions.length * selectedFormats.length}</p>
        </div>
      </CardContent>
    </Card>
  )
}
