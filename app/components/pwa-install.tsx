"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isInWebAppiOS = (window.navigator as any).standalone === true

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    const appInstalledHandler = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", appInstalledHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", appInstalledHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    } catch (error) {
      console.error("Error during installation:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Remember user dismissed the prompt
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  // Don't show if already installed or user previously dismissed
  if (isInstalled || !showInstallPrompt) return null

  const isDismissed = typeof window !== "undefined" && localStorage.getItem("pwa-install-dismissed") === "true"

  if (isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border-2 border-purple-200 rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Download className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Install Banerry</h3>
            <p className="text-sm text-gray-600">Get the app for a better experience</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          <span>Works offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          <span>Faster loading</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
          <span>Home screen access</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleInstall} className="flex-1 bg-purple-600 hover:bg-purple-700">
          Install App
        </Button>
        <Button onClick={handleDismiss} variant="outline" className="border-gray-300 bg-transparent">
          Not now
        </Button>
      </div>
    </div>
  )
}
