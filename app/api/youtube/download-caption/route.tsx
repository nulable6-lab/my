import { type NextRequest, NextResponse } from "next/server"
import { formatSrtTimestamp } from "@/lib/youtube-api"

export const runtime = "edge"

interface DownloadCaptionRequest {
  videoId: string
  captionId: string
  format?: "srt" | "vtt" | "txt"
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, captionId, format = "srt" }: DownloadCaptionRequest = await request.json()

    if (!videoId || !captionId) {
      return NextResponse.json({ error: "Video ID and Caption ID are required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }

    // Download the caption content
    const response = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download caption from YouTube API")
    }

    const captionContent = await response.text()

    // Convert to requested format
    let formattedContent = captionContent
    const language = "en" // Default, should be extracted from caption metadata

    if (format === "srt") {
      formattedContent = convertToSrt(captionContent)
    } else if (format === "vtt") {
      formattedContent = convertToVtt(captionContent)
    } else if (format === "txt") {
      formattedContent = convertToTxt(captionContent)
    }

    return NextResponse.json({
      language,
      content: formattedContent,
      format,
    })
  } catch (error) {
    console.error("Caption download error:", error)
    return NextResponse.json({ error: "Failed to download caption" }, { status: 500 })
  }
}

function convertToSrt(xmlContent: string): string {
  // Parse XML and convert to SRT format
  // This is a simplified implementation - in production, you'd use a proper XML parser
  const lines = xmlContent.split("\n")
  let srtContent = ""
  let index = 1

  // Basic XML parsing for demonstration
  // In production, use a proper XML parser like xml2js
  for (const line of lines) {
    if (line.includes("<text")) {
      const startMatch = line.match(/start="([^"]+)"/)
      const durMatch = line.match(/dur="([^"]+)"/)
      const textMatch = line.match(/>([^<]+)</)

      if (startMatch && durMatch && textMatch) {
        const start = Number.parseFloat(startMatch[1])
        const duration = Number.parseFloat(durMatch[1])
        const end = start + duration
        const text = textMatch[1].trim()

        srtContent += `${index}\n`
        srtContent += `${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n`
        srtContent += `${text}\n\n`
        index++
      }
    }
  }

  return srtContent
}

function convertToVtt(xmlContent: string): string {
  const srtContent = convertToSrt(xmlContent)
  let vttContent = "WEBVTT\n\n"

  // Convert SRT timestamps to VTT format
  vttContent += srtContent.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")

  return vttContent
}

function convertToTxt(xmlContent: string): string {
  // Extract just the text content without timestamps
  const lines = xmlContent.split("\n")
  let txtContent = ""

  for (const line of lines) {
    const textMatch = line.match(/>([^<]+)</)
    if (textMatch) {
      txtContent += textMatch[1].trim() + " "
    }
  }

  return txtContent.trim()
}
