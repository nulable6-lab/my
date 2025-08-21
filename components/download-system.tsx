"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { downloadCaption, type Caption, type YouTubeVideo } from "@/lib/youtube-api"

interface DownloadSystemProps {
  video: YouTubeVideo
  caption: Caption
  className?: string
}

interface DownloadFormat {
  format: "srt" | "vtt" | "txt"
  name: string
  description: string
  extension: string
}

interface DownloadProgress {
  format: string
  status: "pending" | "downloading" | "completed" | "error"
  progress: number
  error?: string
}

const DOWNLOAD_FORMATS: DownloadFormat[] = [
  {
    format: "srt",
    name: "SubRip (.srt)",
    description: "Most compatible format for video players",
    extension: "srt",
  },
  {
    format: "vtt",
    name: "WebVTT (.vtt)",
    description: "Web standard format for HTML5 video",
    extension: "vtt",
  },
  {
    format: "txt",
    name: "Plain Text (.txt)",
    description: "Simple text without timestamps",
    extension: "txt",
  },
]

export function DownloadSystem({ video, caption, className }: DownloadSystemProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["srt"])
  const [customFileName, setCustomFileName] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([])
  const [error, setError] = useState<string | null>(null)
  const [completedDownloads, setCompletedDownloads] = useState<string[]>([])

  const generateFileName = useCallback(
    (format: string): string => {
      const baseFileName = customFileName.trim() || video.title.replace(/[^a-zA-Z0-9\s-_]/g, "").trim()
      const sanitizedFileName = baseFileName.replace(/\s+/g, "_").substring(0, 100)
      const languageCode = caption.language
      return `${sanitizedFileName}_${languageCode}.${format}`
    },
    [customFileName, video.title, caption.language],
  )

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

  const handleFormatToggle = useCallback((format: string, checked: boolean) => {
    setSelectedFormats((prev) => (checked ? [...prev, format] : prev.filter((f) => f !== format)))
  }, [])

  const handleDownload = useCallback(async () => {
    if (selectedFormats.length === 0) {
      setError("Please select at least one download format")
      return
    }

    setIsDownloading(true)
    setError(null)
    setCompletedDownloads([])

    // Initialize progress tracking
    const initialProgress: DownloadProgress[] = selectedFormats.map((format) => ({
      format,
      status: "pending",
      progress: 0,
    }))
    setDownloadProgress(initialProgress)

    try {
      for (let i = 0; i < selectedFormats.length; i++) {
        const format = selectedFormats[i] as "srt" | "vtt" | "txt"

        // Update progress to downloading
        setDownloadProgress((prev) =>
          prev.map((p) => (p.format === format ? { ...p, status: "downloading", progress: 50 } : p)),
        )

        try {
          const captionTrack = await downloadCaption(video.id, caption.id, format)

          if (!captionTrack) {
            throw new Error(`Failed to download ${format.toUpperCase()} format`)
          }

          // Generate filename and download
          const fileName = generateFileName(format)
          const mimeTypes = {
            srt: "text/srt",
            vtt: "text/vtt",
            txt: "text/plain",
          }

          downloadFile(captionTrack.content, fileName, mimeTypes[format])

          // Update progress to completed
          setDownloadProgress((prev) =>
            prev.map((p) => (p.format === format ? { ...p, status: "completed", progress: 100 } : p)),
          )

          setCompletedDownloads((prev) => [...prev, format])

          // Small delay between downloads to prevent overwhelming the browser
          if (i < selectedFormats.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } catch (err) {
          console.error(`Error downloading ${format}:`, err)
          setDownloadProgress((prev) =>
            prev.map((p) =>
              p.format === format
                ? { ...p, status: "error", progress: 0, error: `Failed to download ${format.toUpperCase()}` }
                : p,
            ),
          )
        }
      }
    } catch (err) {
      setError("Download process failed. Please try again.")
      console.error("Download error:", err)
    } finally {
      setIsDownloading(false)
    }
  }, [selectedFormats, video.id, caption.id, generateFileName, downloadFile])

  const allDownloadsCompleted = completedDownloads.length === selectedFormats.length && selectedFormats.length > 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Download Captions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">Select Download Formats</Label>
          <div className="grid gap-3">
            {DOWNLOAD_FORMATS.map((formatOption) => (
              <div
                key={formatOption.format}
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  id={formatOption.format}
                  checked={selectedFormats.includes(formatOption.format)}
                  onCheckedChange={(checked) => handleFormatToggle(formatOption.format, checked as boolean)}
                  disabled={isDownloading}
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={formatOption.format} className="text-sm font-medium text-foreground cursor-pointer">
                    {formatOption.name}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{formatOption.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  .{formatOption.extension}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Custom File Name */}
        <div className="space-y-2">
          <Label htmlFor="fileName" className="text-sm font-medium text-foreground">
            Custom File Name (Optional)
          </Label>
          <Input
            id="fileName"
            placeholder="Leave empty to use video title"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            disabled={isDownloading}
          />
          <div className="text-xs text-muted-foreground">Preview: {generateFileName(selectedFormats[0] || "srt")}</div>
        </div>

        {/* Download Progress */}
        {downloadProgress.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Download Progress</Label>
            {downloadProgress.map((progress) => (
              <div key={progress.format} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{progress.format.toUpperCase()}</span>
                  <Badge
                    variant={
                      progress.status === "completed"
                        ? "default"
                        : progress.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {progress.status === "pending" && "Pending"}
                    {progress.status === "downloading" && "Downloading..."}
                    {progress.status === "completed" && "Completed"}
                    {progress.status === "error" && "Error"}
                  </Badge>
                </div>
                <Progress value={progress.progress} className="h-2" />
                {progress.error && <div className="text-xs text-destructive">{progress.error}</div>}
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

        {/* Success Message */}
        {allDownloadsCompleted && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All downloads completed successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Download Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            disabled={selectedFormats.length === 0 || isDownloading}
            className="flex-1"
            size="lg"
          >
            {isDownloading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Downloading...
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
                Download {selectedFormats.length > 1 ? `${selectedFormats.length} Files` : "Caption"}
              </div>
            )}
          </Button>

          {allDownloadsCompleted && (
            <Button
              variant="outline"
              onClick={() => {
                setDownloadProgress([])
                setCompletedDownloads([])
                setError(null)
              }}
            >
              Download Again
            </Button>
          )}
        </div>

        {/* Download Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Files will be saved to your default download folder</p>
          <p>• Multiple formats can be downloaded simultaneously</p>
          <p>• File names include language code for easy identification</p>
        </div>
      </CardContent>
    </Card>
  )
}
