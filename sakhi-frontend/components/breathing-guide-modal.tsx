"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BreathingGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type BreathPhase = "inhale" | "hold" | "exhale" | "rest"

export function BreathingGuideModal({ open, onOpenChange }: BreathingGuideModalProps) {
  const [isActive, setIsActive] = React.useState(false)
  const [phase, setPhase] = React.useState<BreathPhase>("inhale")
  const [counter, setCounter] = React.useState(4)
  const [cycles, setCycles] = React.useState(0)

  const phaseConfig: Record<BreathPhase, { duration: number; next: BreathPhase; label: string }> = {
    inhale: { duration: 4, next: "hold", label: "Breathe In" },
    hold: { duration: 7, next: "exhale", label: "Hold" },
    exhale: { duration: 8, next: "rest", label: "Breathe Out" },
    rest: { duration: 2, next: "inhale", label: "Rest" },
  }

  React.useEffect(() => {
    if (!isActive || !open) return

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          const currentConfig = phaseConfig[phase]
          const nextPhase = currentConfig.next
          setPhase(nextPhase)
          
          if (nextPhase === "inhale") {
            setCycles((c) => c + 1)
          }
          
          return phaseConfig[nextPhase].duration
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, open])

  const handleStart = () => {
    setIsActive(true)
    setPhase("inhale")
    setCounter(4)
    setCycles(0)
  }

  const handleStop = () => {
    setIsActive(false)
    setPhase("inhale")
    setCounter(4)
  }

  const handleClose = () => {
    handleStop()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">4-7-8 Breathing Technique</DialogTitle>
          <DialogDescription className="text-center">
            A calming breathing exercise to help reduce anxiety and promote relaxation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-8">
          {/* Breathing Circle */}
          <div className="relative flex h-48 w-48 items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-primary/30 transition-all duration-1000",
                isActive && phase === "inhale" && "scale-125 bg-primary/10",
                isActive && phase === "hold" && "scale-125 bg-primary/20",
                isActive && phase === "exhale" && "scale-100 bg-primary/5",
                isActive && phase === "rest" && "scale-100 bg-transparent"
              )}
            />
            <div className="relative z-10 text-center">
              <p className="text-4xl font-bold text-primary">{isActive ? counter : "..."}</p>
              <p className="mt-2 text-lg font-medium text-foreground">
                {isActive ? phaseConfig[phase].label : "Ready?"}
              </p>
            </div>
          </div>

          {/* Cycles counter */}
          {isActive && cycles > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Completed cycles: {cycles}
            </p>
          )}

          {/* Instructions */}
          {!isActive && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p><strong>Inhale</strong> for 4 seconds</p>
              <p><strong>Hold</strong> for 7 seconds</p>
              <p><strong>Exhale</strong> for 8 seconds</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          {!isActive ? (
            <Button onClick={handleStart} className="rounded-full px-8">
              Start Breathing
            </Button>
          ) : (
            <Button onClick={handleStop} variant="outline" className="rounded-full px-8">
              Stop
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
