"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400" />
      </div>
    )
  }

  const isLight = theme === "light"
  const isDark = theme === "dark"

  return (
    <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-0.5">
      <button
        onClick={() => setTheme("light")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          isLight
            ? "bg-white text-black shadow-sm ring-1 ring-black/5"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          !isLight && !isDark
            ? "bg-white text-black shadow-sm ring-1 ring-black/5"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
        aria-label="System mode"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? "bg-neutral-800 text-white shadow-sm ring-1 ring-white/10"
            : "text-neutral-400 hover:text-neutral-600"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}