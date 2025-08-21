"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppFooterProps {
  className?: string
}

export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer className={`border-t border-border bg-card/30 mt-12 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">About CaptionPro</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A free, open-source tool for downloading YouTube video captions and subtitles. Built with modern web
              technologies for fast, reliable downloads with no registration required.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Next.js 15
              </Badge>
              <Badge variant="outline" className="text-xs">
                React 19
              </Badge>
              <Badge variant="outline" className="text-xs">
                TypeScript
              </Badge>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple format support (SRT, VTT, TXT)</li>
              <li>• Batch download multiple languages</li>
              <li>• Auto-generated and manual captions</li>
              <li>• Fast processing with progress tracking</li>
              <li>• No registration or limits required</li>
              <li>• Privacy-focused - no data stored</li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-foreground">Support & Contact</h3>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                This tool uses the YouTube Data API v3 for caption access. Please respect YouTube's terms of service and
                content creators' rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto bg-transparent">
                  <a
                    href="https://t.me/drkingbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.302 1.507-1.123 1.507-1.123 1.507l-2.678-2.018-1.292 1.292c-.129.129-.238.238-.489.238l.174-2.426 4.414-4.003c.194-.174-.042-.271-.302-.097l-5.454 3.426-2.341-.824s-.373-.132-.409-.42c-.036-.287.421-.446.421-.446l9.494-3.676c.785-.321 1.478.193 1.221 1.219z" />
                    </svg>
                    Contact on Telegram
                  </a>
                </Button>
              </div>
              <p className="text-xs">
                For educational and accessibility purposes only. Not affiliated with YouTube or Google.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ by CaptionPro • © 2024 CaptionPro • Open Source •
            <a
              href="https://t.me/drkingbd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground ml-1"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
