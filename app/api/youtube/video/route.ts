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
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from YouTube API")
    }

    const data: YouTubeVideoResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = data.items[0]
    const videoInfo = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
    }

    return NextResponse.json(videoInfo)
  } catch (error) {
    console.error("YouTube API error:", error)
    return NextResponse.json({ error: "Failed to fetch video information" }, { status: 500 })
  }
}
