"use client"

import * as React from "react"
import { Plus, Lock, Shield, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MoodSelector, getMoodEmoji } from "@/components/mood-selector"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  FairyLightsDecor,
  BookStackDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  createdAt: Date
}

const initialEntries: JournalEntry[] = [
  {
    id: "1",
    title: "A better day",
    content: "Today felt lighter than yesterday. I managed to go for a short walk and actually enjoyed the sunshine. Small wins matter. I reminded myself that healing isn't linear, and it's okay to have ups and downs.",
    mood: "calm",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Struggling but trying",
    content: "It's been hard to get out of bed lately. But I'm trying to be gentle with myself. I made myself a cup of tea and sat by the window for a few minutes. That's enough for today.",
    mood: "sad",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Grateful for support",
    content: "I reached out to a friend today. It was scary, but they listened without judgment. Sometimes vulnerability is the bravest thing we can do.",
    mood: "happy",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
]

export default function JournalPage() {
  const [entries, setEntries] = React.useState<JournalEntry[]>(initialEntries)
  const [selectedEntry, setSelectedEntry] = React.useState<JournalEntry | null>(null)
  const [showNewEntryDialog, setShowNewEntryDialog] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  // New entry form state
  const [newTitle, setNewTitle] = React.useState("")
  const [newContent, setNewContent] = React.useState("")
  const [newMood, setNewMood] = React.useState("")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const getEntriesForDay = (day: number) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt)
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === currentMonth.getMonth() &&
        entryDate.getFullYear() === currentMonth.getFullYear()
      )
    })
  }

  const handleCreateEntry = () => {
    if (!newTitle.trim() || !newContent.trim() || !newMood) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      mood: newMood,
      createdAt: new Date(),
    }

    setEntries((prev) => [newEntry, ...prev])
    setNewTitle("")
    setNewContent("")
    setNewMood("")
    setShowNewEntryDialog(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    setSelectedEntry(null)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture relative overflow-hidden">
      {/* Cozy decorations */}
      <FairyLightsDecor className="absolute top-16 left-0 right-0 w-full h-8 opacity-40 hidden lg:block" />
      <PlantDecor className="absolute top-32 left-4 w-12 h-16 opacity-40 animate-sway hidden xl:block" />
      <CandleDecor className="absolute top-40 right-8 w-8 h-14 opacity-40 hidden xl:block" />
      <BookStackDecor className="absolute bottom-32 right-4 w-10 h-14 opacity-30 hidden xl:block" />
      
      {/* Wall quote */}
      <div className="absolute top-28 right-1/4 hidden xl:block">
        <QuoteFrame quote="Write your story" className="text-xs rotate-[1deg]" />
      </div>
      
      <Navbar />

      <main className="container mx-auto flex-1 p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StickerDecor text="private" variant="sage" />
                <StickerDecor text="encrypted" variant="lavender" className="hidden sm:block" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                My Journal
              </h1>
              <p className="mt-2 text-muted-foreground">
                A private space for your thoughts and reflections.
              </p>
            </div>

            <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Journal Entry</DialogTitle>
                  <DialogDescription>
                    Express yourself freely. Your entries are private and secure.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your entry a title..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>How are you feeling?</Label>
                    <MoodSelector value={newMood} onChange={setNewMood} size="sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Your thoughts</Label>
                    <Textarea
                      id="content"
                      placeholder="Write whatever is on your mind..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[200px] rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleCreateEntry}
                    disabled={!newTitle.trim() || !newContent.trim() || !newMood}
                    className="w-full rounded-full"
                  >
                    Save Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>End-to-End Encrypted</span>
            <Lock className="h-3 w-3" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-1 border-border/40">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("prev")}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonth("next")}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEntries = getEntriesForDay(day)
                  const hasEntries = dayEntries.length > 0
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear()

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        if (hasEntries) {
                          setSelectedEntry(dayEntries[0])
                        }
                      }}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
                        hasEntries && "bg-primary/10 hover:bg-primary/20 cursor-pointer",
                        isToday && "ring-2 ring-primary",
                        !hasEntries && "text-muted-foreground"
                      )}
                    >
                      {day}
                      {hasEntries && (
                        <span className="text-xs">{getMoodEmoji(dayEntries[0].mood)}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Entries List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-lg">Recent Entries</h2>
            
            {entries.length === 0 ? (
              <Card className="border-border/40 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No journal entries yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Start writing to track your journey.
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card
                  key={entry.id}
                  className={cn(
                    "cursor-pointer border-border/40 transition-all hover:shadow-md hover:border-primary/20",
                    selectedEntry?.id === entry.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        <div>
                          <CardTitle className="text-base">{entry.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {formatDate(entry.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Entry Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="sm:max-w-2xl">
            {selectedEntry && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMoodEmoji(selectedEntry.mood)}</span>
                    <div>
                      <DialogTitle className="text-xl">{selectedEntry.title}</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedEntry.createdAt)}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {selectedEntry.content}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/40">
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="mr-1 h-3 w-3" />
                    Private & Encrypted
                  </Badge>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your journal entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEntry(selectedEntry.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}
