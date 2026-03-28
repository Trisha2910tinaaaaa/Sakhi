"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Copy, Heart, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const affirmations = {
  "self-love": [
    "I am worthy of love and respect, exactly as I am.",
    "I embrace my imperfections as part of my unique beauty.",
    "I deserve kindness, especially from myself.",
    "My self-worth is not defined by others' opinions.",
    "I am enough, just as I am today.",
  ],
  strength: [
    "I have overcome challenges before, and I will again.",
    "My resilience is greater than any obstacle.",
    "I am stronger than I think I am.",
    "Every setback is a setup for a comeback.",
    "I have the power to create positive change.",
  ],
  calm: [
    "I release tension with every exhale.",
    "Peace flows through me like a gentle stream.",
    "I am safe in this present moment.",
    "I choose serenity over stress.",
    "My mind is calm, my heart is at peace.",
  ],
  hope: [
    "Better days are ahead of me.",
    "Every sunrise brings new possibilities.",
    "I believe in the magic of new beginnings.",
    "Hope is the light that guides me forward.",
    "Tomorrow holds endless potential.",
  ],
  resilience: [
    "I bend but I do not break.",
    "Healing is not linear, and that is okay.",
    "I am learning and growing every day.",
    "My journey is valid, no matter the pace.",
    "I trust the process of my healing.",
  ],
}

type Category = keyof typeof affirmations

interface AffirmationCardProps {
  category?: Category
  onSave?: (affirmation: string, category: Category) => void
  savedAffirmations?: string[]
}

export function AffirmationCard({ category = "self-love", onSave, savedAffirmations = [] }: AffirmationCardProps) {
  const [currentCategory, setCurrentCategory] = React.useState<Category>(category)
  const [currentAffirmation, setCurrentAffirmation] = React.useState("")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const getRandomAffirmation = React.useCallback((cat: Category) => {
    const categoryAffirmations = affirmations[cat]
    const randomIndex = Math.floor(Math.random() * categoryAffirmations.length)
    return categoryAffirmations[randomIndex]
  }, [])

  React.useEffect(() => {
    setCurrentAffirmation(getRandomAffirmation(currentCategory))
  }, [currentCategory, getRandomAffirmation])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setCurrentAffirmation(getRandomAffirmation(currentCategory))
      setIsRefreshing(false)
    }, 300)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentAffirmation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSave?.(currentAffirmation, currentCategory)
  }

  const isSaved = savedAffirmations.includes(currentAffirmation)

  const categories: { key: Category; label: string }[] = [
    { key: "self-love", label: "Self-Love" },
    { key: "strength", label: "Strength" },
    { key: "calm", label: "Calm" },
    { key: "hope", label: "Hope" },
    { key: "resilience", label: "Resilience" },
  ]

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-lavender/20 via-background to-sage/20 shadow-lg">
      <CardContent className="p-8">
        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCurrentCategory(cat.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                currentCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Affirmation Display */}
        <div className="min-h-[120px] flex items-center justify-center">
          <p
            className={cn(
              "text-center font-serif text-2xl font-medium leading-relaxed text-foreground md:text-3xl transition-opacity",
              isRefreshing ? "opacity-0" : "opacity-100"
            )}
          >
            {`"${currentAffirmation}"`}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="sr-only">New affirmation</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="rounded-full"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy affirmation</span>
          </Button>

          {onSave && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              className={cn("rounded-full", isSaved && "bg-gentle-rose/20")}
              disabled={isSaved}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current text-destructive")} />
              <span className="sr-only">Save affirmation</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
