"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "😢", label: "Upset", value: "upset" },
  { emoji: "😴", label: "Tired", value: "tired" },
]

interface MoodSelectorProps {
  value?: string
  onChange?: (value: string) => void
  size?: "sm" | "md" | "lg"
}

export function MoodSelector({ value, onChange, size = "md" }: MoodSelectorProps) {
  const sizeClasses = {
    sm: "h-10 w-10 text-lg",
    md: "h-14 w-14 text-2xl",
    lg: "h-16 w-16 text-3xl",
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange?.(mood.value)}
          className={cn(
            "flex items-center justify-center rounded-full border-2 transition-all hover:scale-110",
            sizeClasses[size],
            value === mood.value
              ? "border-primary bg-primary/10 shadow-md"
              : "border-transparent bg-muted hover:bg-muted/80"
          )}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  )
}

export function getMoodEmoji(value: string): string {
  const mood = moods.find((m) => m.value === value)
  return mood?.emoji || "😐"
}

export function getMoodLabel(value: string): string {
  const mood = moods.find((m) => m.value === value)
  return mood?.label || "Neutral"
}

export { moods }
