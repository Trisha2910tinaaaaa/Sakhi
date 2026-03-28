"use client"

import * as React from "react"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AffirmationCard } from "@/components/affirmation-card"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  FairyLightsDecor,
  DiffuserDecor,
  BookStackDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SavedAffirmation {
  text: string
  category: string
  savedAt: Date
}

export default function AffirmationsPage() {
  const [savedAffirmations, setSavedAffirmations] = React.useState<SavedAffirmation[]>([
    {
      text: "I am worthy of love and respect, exactly as I am.",
      category: "self-love",
      savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      text: "My resilience is greater than any obstacle.",
      category: "strength",
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ])

  const handleSaveAffirmation = (text: string, category: string) => {
    const newAffirmation: SavedAffirmation = {
      text,
      category,
      savedAt: new Date(),
    }
    setSavedAffirmations((prev) => [newAffirmation, ...prev])
    toast.success("Affirmation saved to your collection")
  }

  const handleRemoveAffirmation = (text: string) => {
    setSavedAffirmations((prev) => prev.filter((a) => a.text !== text))
    toast.success("Affirmation removed from collection")
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "self-love": "Self-Love",
      strength: "Strength",
      calm: "Calm",
      hope: "Hope",
      resilience: "Resilience",
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "self-love": "bg-gentle-rose/20 text-foreground border border-gentle-rose/30",
      strength: "bg-primary/10 text-primary border border-primary/20",
      calm: "bg-soft-blue/20 text-foreground border border-soft-blue/30",
      hope: "bg-sage/20 text-secondary-foreground border border-sage/30",
      resilience: "bg-lavender/20 text-foreground border border-lavender/30",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture relative overflow-hidden">
      <Navbar />
      
      {/* Cozy decorations */}
      <FairyLightsDecor className="absolute top-16 left-0 right-0 w-full h-8 opacity-40" />
      <PlantDecor className="absolute top-32 left-4 w-14 h-20 opacity-40 animate-sway hidden lg:block" />
      <CandleDecor className="absolute top-40 right-8 w-10 h-16 opacity-40 hidden lg:block" />
      <DiffuserDecor className="absolute top-56 left-8 w-10 h-14 opacity-30 hidden xl:block" />
      <BookStackDecor className="absolute bottom-32 right-4 w-12 h-16 opacity-30 hidden lg:block" />
      
      {/* Wall quotes */}
      <div className="absolute top-28 right-1/4 hidden xl:block">
        <QuoteFrame quote="You are enough" className="text-xs rotate-[2deg]" />
      </div>

      <main className="container mx-auto flex-1 p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <StickerDecor text="daily reminder" variant="lavender" />
            <StickerDecor text="self-love" variant="rose" className="hidden sm:block" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Daily Affirmations
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gentle reminders of your worth, strength, and resilience.
          </p>
        </div>

        {/* Main Affirmation Card */}
        <div className="mx-auto max-w-2xl">
          <AffirmationCard
            onSave={handleSaveAffirmation}
            savedAffirmations={savedAffirmations.map((a) => a.text)}
          />
        </div>

        {/* Saved Affirmations */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Your Collection
              </h2>
              <StickerDecor text="saved" variant="sage" className="hidden sm:block" />
            </div>
            <span className="text-sm text-muted-foreground">
              {savedAffirmations.length} saved
            </span>
          </div>

          {savedAffirmations.length === 0 ? (
            <Card className="border-border/40 border-dashed bg-card/80 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No saved affirmations yet.</p>
                <p className="text-sm text-muted-foreground">
                  Click the heart icon to save affirmations that resonate with you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedAffirmations.map((affirmation, index) => (
                <Card
                  key={index}
                  className="group border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          getCategoryColor(affirmation.category)
                        )}
                      >
                        {getCategoryLabel(affirmation.category)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveAffirmation(affirmation.text)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                    <p className="mt-3 font-serif text-lg leading-relaxed text-foreground">
                      <span className="text-primary/60">{`"`}</span>
                      {affirmation.text}
                      <span className="text-primary/60">{`"`}</span>
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Saved {new Date(affirmation.savedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inspiration Section */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-sage/10 via-card to-lavender/10 p-8 text-center md:p-12 border border-border/40 backdrop-blur-sm relative overflow-hidden">
          <CandleDecor className="absolute top-4 left-4 w-8 h-12 opacity-30 hidden md:block" />
          <PlantDecor className="absolute bottom-4 right-4 w-10 h-14 opacity-30 hidden md:block" />
          
          <StickerDecor text="how-to" variant="cream" className="mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground md:text-2xl">
            How to Use Affirmations
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold text-foreground">Read Aloud</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Say the affirmation out loud to yourself, ideally while looking in a mirror.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold text-foreground">Feel It</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Close your eyes and let the words resonate. Feel their truth within you.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold text-foreground">Repeat Daily</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Make affirmations part of your morning or evening routine.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
