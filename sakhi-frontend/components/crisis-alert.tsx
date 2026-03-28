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
import { Phone, MessageCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface CrisisAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrisisAlert({ open, onOpenChange }: CrisisAlertProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">You&apos;re Not Alone</DialogTitle>
          <DialogDescription className="text-center text-base">
            If you&apos;re in crisis or having thoughts of self-harm, please reach out for immediate support.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <a
            href="tel:988"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">988 Suicide & Crisis Lifeline</p>
              <p className="text-sm text-muted-foreground">Call or text 988, 24/7</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="sms:741741&body=HOME"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Crisis Text Line</p>
              <p className="text-sm text-muted-foreground">Text HOME to 741741</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="tel:911"
            className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 transition-colors hover:bg-destructive/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
              <Phone className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Emergency Services</p>
              <p className="text-sm text-muted-foreground">Call 911</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-center text-sm text-muted-foreground">
              Connect with a licensed therapist
            </p>
            <Button variant="outline" className="mt-2 w-full rounded-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
