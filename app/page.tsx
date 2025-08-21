import { Suspense } from "react"
import { YouTubeCaptionDownloader } from "@/components/youtube-caption-downloader"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Multiple Formats</h3>
                <p className="text-sm text-muted-foreground">Download in SRT, VTT, or plain text format</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Fast & Free</h3>
                <p className="text-sm text-muted-foreground">Quick processing with no usage limits</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-secondary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">No data stored, processed securely</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Downloader Component */}
          <Suspense
            fallback={
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading downloader...</p>
                </CardContent>
              </Card>
            }
          >
            <YouTubeCaptionDownloader />
          </Suspense>

          {/* Instructions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">How to Use</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    1
                  </span>
                  <span>Copy the URL of any YouTube video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    2
                  </span>
                  <span>Paste the URL in the input field above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    3
                  </span>
                  <span>Select your preferred caption language and format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    4
                  </span>
                  <span>Click download to save the captions to your device</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <AppFooter />
    </main>
  )
}
