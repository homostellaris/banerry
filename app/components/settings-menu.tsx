"use client"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import VoiceSelector from "./voice-selector"

export default function SettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 rounded-full h-12 w-12 bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
          aria-label="Open settings"
        >
          <Settings className="h-6 w-6 text-gray-700 font-bold" strokeWidth={2.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="text-lg font-semibold">Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-4 py-2">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Text-to-Speech</h3>
            <VoiceSelector />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
