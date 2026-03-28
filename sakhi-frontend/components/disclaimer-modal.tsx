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
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle } from "lucide-react"

interface DisclaimerModalProps {
  open: boolean
  onAccept: () => void
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  const [accepted, setAccepted] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Important Notice</DialogTitle>
          <DialogDescription className="text-center">
            Please read and acknowledge before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
            <p className="mb-3">
              <strong>Sakhi</strong> is a supportive companion designed to help you reflect, 
              process emotions, and access mental wellness resources.
            </p>
            <p className="mb-3">
              <strong>However, Sakhi is not:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>A replacement for professional mental health treatment</li>
              <li>A crisis intervention service</li>
              <li>A medical diagnosis tool</li>
              <li>A substitute for licensed therapy</li>
            </ul>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-foreground">
              If you are in crisis or experiencing thoughts of self-harm:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Call <strong>988</strong> (Suicide & Crisis Lifeline)</li>
              <li>• Text <strong>HOME</strong> to <strong>741741</strong></li>
              <li>• Call <strong>911</strong> for emergencies</li>
            </ul>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="disclaimer"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="disclaimer"
              className="text-sm leading-relaxed text-muted-foreground cursor-pointer"
            >
              I understand that Sakhi is not a replacement for professional therapy. 
              In a crisis, I will contact emergency services or crisis helplines.
            </label>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={onAccept}
            disabled={!accepted}
            className="w-full rounded-full"
          >
            I Understand, Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
