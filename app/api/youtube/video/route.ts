import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

interface YouTubeVideoSnippet {
  title: string
  description: string
  thumbnails: {
    default?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    high?: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
}

interface YouTubeVideoItem {
  id: string
  snippet: YouTubeVideoSnippet
}

interface YouTubeVideoResponse {
  items: YouTubeVideoItem[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get("id")

  if (!videoId) {
    return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
  }

  try {
    console.log("[v0] Fetching video info for ID:", videoId)

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`,
    )

    console.log("[v0] YouTube API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] YouTube API error response:", errorText)

      if (response.status === 403) {
        return NextResponse.json({ error: "YouTube API quota exceeded or invalid API key" }, { status: 403 })
      }
      if (response.status === 400) {
        return NextResponse.json({ error: "Invalid video ID format" }, { status: 400 })
      }

      throw new Error(`YouTube API returned ${response.status}: ${errorText}`)
    }

    const data: YouTubeVideoResponse = await response.json()
    console.log("[v0] YouTube API response data:", JSON.stringify(data, null, 2))

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found or is not accessible" }, { status: 404 })
    }

    const video = data.items[0]
    const videoInfo = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
    }

    console.log("[v0] Successfully fetched video info:", videoInfo.title)
    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error("[v0] YouTube API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch video information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
