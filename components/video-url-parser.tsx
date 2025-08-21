"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { extractVideoId, isValidYouTubeUrl, fetchVideoInfo, type YouTubeVideo } from "@/lib/youtube-api"

interface VideoUrlParserProps {
  onVideoSelected: (video: YouTubeVideo) => void
  className?: string
}

export function VideoUrlParser({ onVideoSelected, className }: VideoUrlParserProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<YouTubeVideo | null>(null)

  const handleUrlChange = useCallback(
    (value: string) => {
      setUrl(value)
      setError(null)

      // Clear video info if URL becomes invalid
      if (videoInfo && !isValidYouTubeUrl(value)) {
        setVideoInfo(null)
      }
    },
    [videoInfo],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!url.trim()) {
        setError("Please enter a YouTube URL")
        return
      }

      if (!isValidYouTubeUrl(url)) {
        setError("Please enter a valid YouTube URL")
        return
      }

      const videoId = extractVideoId(url)
      if (!videoId) {
        setError("Could not extract video ID from URL")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const video = await fetchVideoInfo(videoId)

        if (!video) {
          setError("Video not found or is not accessible")
          return
        }

        setVideoInfo(video)
        onVideoSelected(video)
      } catch (err) {
        setError("Failed to fetch video information. Please try again.")
        console.error("Error fetching video info:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [url, onVideoSelected],
  )

  const handleClear = useCallback(() => {
    setUrl("")
    setError(null)
    setVideoInfo(null)
  }, [])

  const isValidUrl = url.trim() && isValidYouTubeUrl(url)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Enter YouTube URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!isValidUrl || isLoading} className="px-6">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Loading
                  </div>
                ) : (
                  "Analyze"
                )}
              </Button>
              {(url || videoInfo) && (
                <Button type="button" variant="outline" onClick={handleClear} disabled={isLoading}>
                  Clear
                </Button>
              )}
            </div>

            {/* URL Format Help */}
            <div className="text-xs text-muted-foreground">
              Supported formats: youtube.com/watch?v=..., youtu.be/..., or direct video ID
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* URL Validation Indicator */}
          {url && !error && (
            <div className="flex items-center gap-2">
              {isValidUrl ? (
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid URL
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Invalid URL
                </Badge>
              )}
            </div>
          )}
        </form>

        {/* Video Information Display */}
        {videoInfo && (
          <div className="border-t border-border pt-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={videoInfo.thumbnails.medium.url || "/placeholder.svg"}
                  alt={videoInfo.title}
                  className="w-24 h-18 object-cover rounded-md border border-border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground line-clamp-2 mb-1">{videoInfo.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {videoInfo.description || "No description available"}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    ID: {videoInfo.id}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
