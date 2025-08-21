"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCaptions, type Caption, type YouTubeVideo } from "@/lib/youtube-api"

interface CaptionFetcherProps {
  video: YouTubeVideo
  onCaptionSelected: (caption: Caption) => void
  className?: string
}

export function CaptionFetcher({ video, onCaptionSelected, className }: CaptionFetcherProps) {
  const [captions, setCaptions] = useState<Caption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null)

  const loadCaptions = useCallback(async () => {
    if (!video?.id) return

    setIsLoading(true)
    setError(null)
    setCaptions([])
    setSelectedCaption(null)

    try {
      const fetchedCaptions = await fetchCaptions(video.id)

      if (fetchedCaptions.length === 0) {
        setError("No captions available for this video")
        return
      }

      setCaptions(fetchedCaptions)

      // Auto-select English captions if available, otherwise select the first one
      const englishCaption = fetchedCaptions.find((cap) => cap.language === "en" || cap.language === "en-US")
      const defaultCaption = englishCaption || fetchedCaptions[0]
      setSelectedCaption(defaultCaption)
      onCaptionSelected(defaultCaption)
    } catch (err) {
      setError("Failed to fetch captions. Please try again.")
      console.error("Error fetching captions:", err)
    } finally {
      setIsLoading(false)
    }
  }, [video?.id, onCaptionSelected])

  // Load captions when video changes
  useEffect(() => {
    loadCaptions()
  }, [loadCaptions])

  const handleCaptionSelect = useCallback(
    (caption: Caption) => {
      setSelectedCaption(caption)
      onCaptionSelected(caption)
    },
    [onCaptionSelected],
  )

  const getLanguageDisplayName = (languageCode: string): string => {
    const languageNames: Record<string, string> = {
      en: "English",
      "en-US": "English (US)",
      "en-GB": "English (UK)",
      es: "Spanish",
      "es-ES": "Spanish (Spain)",
      "es-MX": "Spanish (Mexico)",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      "pt-BR": "Portuguese (Brazil)",
      ru: "Russian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      "zh-CN": "Chinese (Simplified)",
      "zh-TW": "Chinese (Traditional)",
      ar: "Arabic",
      hi: "Hindi",
      nl: "Dutch",
      sv: "Swedish",
      no: "Norwegian",
      da: "Danish",
      fi: "Finnish",
      pl: "Polish",
      tr: "Turkish",
      th: "Thai",
      vi: "Vietnamese",
    }

    return languageNames[languageCode] || languageCode.toUpperCase()
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Available Captions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Fetching available captions...
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
          Available Captions
          {captions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {captions.length} language{captions.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadCaptions} className="ml-2 bg-transparent">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {captions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select the caption language you want to download:</p>

            <div className="grid gap-2">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCaption?.id === caption.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                  onClick={() => handleCaptionSelect(caption)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedCaption?.id === caption.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {selectedCaption?.id === caption.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-foreground">{getLanguageDisplayName(caption.language)}</div>
                      <div className="text-sm text-muted-foreground">{caption.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {caption.isAutoGenerated && (
                      <Badge variant="outline" className="text-xs">
                        Auto-generated
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {caption.language}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {selectedCaption && (
              <div className="mt-4 p-3 bg-accent/20 rounded-lg border border-accent/30">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-accent-foreground">
                    Selected: <strong>{getLanguageDisplayName(selectedCaption.language)}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {captions.length === 0 && !error && !isLoading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">No captions available for this video</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
