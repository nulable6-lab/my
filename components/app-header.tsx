"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={`border-b border-border bg-card/50 ${className}`}>
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">CaptionPro</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Free YouTube caption & subtitle downloader</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              Free & Open Source
            </Badge>
            <Button variant="outline" size="sm" asChild className="flex-shrink-0 bg-transparent">
              <a href="https://t.me/drkingbd" target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.302 1.507-1.123 1.507-1.123 1.507l-2.678-2.018-1.292 1.292c-.129.129-.238.238-.489.238l.174-2.426 4.414-4.003c.194-.174-.042-.271-.302-.097l-5.454 3.426-2.341-.824s-.373-.132-.409-.42c-.036-.287.421-.446.421-.446l9.494-3.676c.785-.321 1.478.193 1.221 1.219z" />
                </svg>
                <span className="hidden sm:inline">Contact</span>
                <span className="sm:hidden">Help</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
