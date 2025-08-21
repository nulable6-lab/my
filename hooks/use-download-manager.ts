"use client"

import { useState, useCallback } from "react"
import { downloadCaption, type Caption, type YouTubeVideo } from "@/lib/youtube-api"

interface DownloadItem {
  id: string
  videoId: string
  caption: Caption
  format: "srt" | "vtt" | "txt"
  fileName: string
  status: "pending" | "downloading" | "completed" | "error"
  progress: number
  error?: string
}

export function useDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [isDownloading, setIsDownloading] = useState(false)

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

  const generateFileName = useCallback((video: YouTubeVideo, caption: Caption, format: string): string => {
    const baseFileName = video.title.replace(/[^a-zA-Z0-9\s-_]/g, "").trim()
    const sanitizedFileName = baseFileName.replace(/\s+/g, "_").substring(0, 100)
    return `${sanitizedFileName}_${caption.language}.${format}`
  }, [])

  const addDownload = useCallback(
    (video: YouTubeVideo, caption: Caption, format: "srt" | "vtt" | "txt"): string => {
      const id = `${video.id}_${caption.id}_${format}_${Date.now()}`
      const fileName = generateFileName(video, caption, format)

      const downloadItem: DownloadItem = {
        id,
        videoId: video.id,
        caption,
        format,
        fileName,
        status: "pending",
        progress: 0,
      }

      setDownloads((prev) => [...prev, downloadItem])
      return id
    },
    [generateFileName],
  )

  const startDownload = useCallback(
    async (downloadId: string) => {
      const download = downloads.find((d) => d.id === downloadId)
      if (!download) return

      setDownloads((prev) => prev.map((d) => (d.id === downloadId ? { ...d, status: "downloading", progress: 50 } : d)))

      try {
        const captionTrack = await downloadCaption(download.videoId, download.caption.id, download.format)

        if (!captionTrack) {
          throw new Error(`Failed to download ${download.format.toUpperCase()} format`)
        }

        const mimeTypes = {
          srt: "text/srt",
          vtt: "text/vtt",
          txt: "text/plain",
        }

        downloadFile(captionTrack.content, download.fileName, mimeTypes[download.format])

        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, status: "completed", progress: 100 } : d)),
        )
      } catch (error) {
        console.error("Download error:", error)
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, status: "error", progress: 0, error: "Download failed" } : d)),
        )
      }
    },
    [downloads, downloadFile],
  )

  const startBatchDownload = useCallback(
    async (downloadIds: string[]) => {
      setIsDownloading(true)

      try {
        for (const downloadId of downloadIds) {
          await startDownload(downloadId)
          // Small delay between downloads
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } finally {
        setIsDownloading(false)
      }
    },
    [startDownload],
  )

  const removeDownload = useCallback((downloadId: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== downloadId))
  }, [])

  const clearCompleted = useCallback(() => {
    setDownloads((prev) => prev.filter((d) => d.status !== "completed"))
  }, [])

  const clearAll = useCallback(() => {
    setDownloads([])
  }, [])

  return {
    downloads,
    isDownloading,
    addDownload,
    startDownload,
    startBatchDownload,
    removeDownload,
    clearCompleted,
    clearAll,
  }
}
