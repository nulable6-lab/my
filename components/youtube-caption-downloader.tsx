"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoUrlParserEnhanced } from "@/components/video-url-parser-enhanced"
import { CaptionFetcher } from "@/components/caption-fetcher"
import { DownloadSystem } from "@/components/download-system"
import { BatchDownloadSystem } from "@/components/batch-download-system"
import { CaptionPreview } from "@/components/caption-preview"
import type { YouTubeVideo, Caption } from "@/lib/youtube-api"

type AppStep = "url-input" | "caption-selection" | "download"

export function YouTubeCaptionDownloader() {
  const [currentStep, setCurrentStep] = useState<AppStep>("url-input")
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [availableCaptions, setAvailableCaptions] = useState<Caption[]>([])
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null)
  const [showBatchDownload, setShowBatchDownload] = useState(false)

  const handleVideoSelected = useCallback((video: YouTubeVideo) => {
    setSelectedVideo(video)
    setCurrentStep("caption-selection")
    setAvailableCaptions([])
    setSelectedCaption(null)
  }, [])

  const handleCaptionSelected = useCallback((caption: Caption) => {
    setSelectedCaption(caption)
  }, [])

  const handleCaptionsLoaded = useCallback((captions: Caption[]) => {
    setAvailableCaptions(captions)
    if (captions.length > 0) {
      setCurrentStep("download")
    }
  }, [])

  const handleStartOver = useCallback(() => {
    setCurrentStep("url-input")
    setSelectedVideo(null)
    setAvailableCaptions([])
    setSelectedCaption(null)
    setShowBatchDownload(false)
  }, [])

  const handleBackToCaption = useCallback(() => {
    setCurrentStep("caption-selection")
    setSelectedCaption(null)
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
              {/* Step 1: URL Input */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    currentStep === "url-input"
                      ? "bg-primary text-primary-foreground"
                      : selectedVideo
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep === "url-input" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Enter URL
                </span>
              </div>

              <div className="w-4 sm:w-8 h-px bg-border flex-shrink-0"></div>

              {/* Step 2: Caption Selection */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    currentStep === "caption-selection"
                      ? "bg-primary text-primary-foreground"
                      : availableCaptions.length > 0
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep === "caption-selection" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Select Captions
                </span>
              </div>

              <div className="w-4 sm:w-8 h-px bg-border flex-shrink-0"></div>

              {/* Step 3: Download */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    currentStep === "download" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep === "download" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Download
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              {selectedVideo && (
                <Badge variant="outline" className="text-xs max-w-full truncate">
                  {selectedVideo.title.length > 40 ? `${selectedVideo.title.substring(0, 40)}...` : selectedVideo.title}
                </Badge>
              )}
              {currentStep !== "url-input" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="w-full sm:w-auto bg-transparent"
                >
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: URL Input */}
      {currentStep === "url-input" && (
        <VideoUrlParserEnhanced onVideoSelected={handleVideoSelected} autoAnalyze={true} />
      )}

      {/* Step 2: Caption Selection */}
      {currentStep === "caption-selection" && selectedVideo && (
        <div className="space-y-6">
          <CaptionFetcher
            video={selectedVideo}
            onCaptionSelected={(caption) => {
              handleCaptionSelected(caption)
              handleCaptionsLoaded(availableCaptions.length > 0 ? availableCaptions : [caption])
            }}
          />

          {availableCaptions.length > 0 && (
            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep("download")} disabled={!selectedCaption} size="lg" className="px-8">
                Proceed to Download
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Download */}
      {currentStep === "download" && selectedVideo && selectedCaption && (
        <div className="space-y-4 sm:space-y-6">
          {/* Download Options */}
          <Tabs value={showBatchDownload ? "batch" : "single"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" onClick={() => setShowBatchDownload(false)} className="text-xs sm:text-sm">
                Single Download
              </TabsTrigger>
              <TabsTrigger
                value="batch"
                onClick={() => setShowBatchDownload(true)}
                disabled={availableCaptions.length <= 1}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Batch Download</span>
                <span className="sm:hidden">Batch</span>
                {availableCaptions.length > 1 && (
                  <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                    {availableCaptions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <DownloadSystem video={selectedVideo} caption={selectedCaption} />
                <CaptionPreview videoId={selectedVideo.id} caption={selectedCaption} />
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-6">
              {availableCaptions.length > 1 ? (
                <BatchDownloadSystem video={selectedVideo} captions={availableCaptions} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">
                      Batch download requires multiple caption languages. This video only has one caption language
                      available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button variant="outline" onClick={handleBackToCaption} className="w-full sm:w-auto bg-transparent">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Caption Selection</span>
              <span className="sm:hidden">Back to Captions</span>
            </Button>

            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto bg-transparent">
              <span className="hidden sm:inline">Download Another Video</span>
              <span className="sm:hidden">New Video</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
