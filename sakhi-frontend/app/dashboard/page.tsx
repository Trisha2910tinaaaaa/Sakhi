"use client"

import * as React from "react"
import Link from "next/link"
import { MessageCircle, BookOpen, Sparkles, Users, ArrowRight, TrendingUp, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getMoodEmoji, getMoodLabel } from "@/components/mood-selector"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  FairyLightsDecor,
  BookStackDecor,
  ClockDecor,
  DiffuserDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"

// Mock user data
const userData = {
  username: "HealingSoul_42",
  currentMood: "calm",
  joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
}

const recentJournalEntries = [
  {
    id: "1",
    title: "A better day",
    mood: "calm",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    preview: "Today felt lighter than yesterday. I managed to go for a short walk...",
  },
  {
    id: "2",
    title: "Struggling but trying",
    mood: "sad",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    preview: "It's been hard to get out of bed lately...",
  },
]

const savedAffirmations = [
  "I am worthy of love and respect, exactly as I am.",
  "My resilience is greater than any obstacle.",
]

const recentCommunityPosts = [
  {
    id: "1",
    title: "My first week on Sakhi",
    likes: 23,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

const moodHistory = [
  { date: "Mon", mood: "anxious", value: 2 },
  { date: "Tue", mood: "sad", value: 1 },
  { date: "Wed", mood: "neutral", value: 3 },
  { date: "Thu", mood: "calm", value: 4 },
  { date: "Fri", mood: "calm", value: 4 },
  { date: "Sat", mood: "happy", value: 5 },
  { date: "Sun", mood: "calm", value: 4 },
]

const moodColors: Record<string, string> = {
  happy: "bg-sage",
  calm: "bg-soft-blue",
  neutral: "bg-muted-foreground",
  sad: "bg-lavender",
  anxious: "bg-gentle-rose",
  frustrated: "bg-destructive/50",
  upset: "bg-destructive/30",
  tired: "bg-muted",
}

export default function DashboardPage() {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture">
      <Navbar />

      <main className="container mx-auto flex-1 p-4 md:p-6 relative">
        {/* Cozy decorations */}
        <FairyLightsDecor className="absolute top-0 left-0 right-0 w-full h-6 opacity-40 hidden lg:block" />
        <PlantDecor className="absolute top-16 right-4 w-12 h-16 opacity-40 animate-sway hidden xl:block" />
        <CandleDecor className="absolute top-32 right-8 w-8 h-14 opacity-30 hidden xl:block" />
        <ClockDecor className="absolute top-20 left-4 w-10 h-10 opacity-30 hidden xl:block" />
        
        {/* Welcome Header */}
        <div className="mb-8 relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {userData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                    Welcome back, {userData.username.split("_")[0]}
                  </h1>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Current mood:</span>
                  <span className="text-xl">{getMoodEmoji(userData.currentMood)}</span>
                  <span className="text-foreground font-medium">{getMoodLabel(userData.currentMood)}</span>
                </p>
              </div>
            </div>
            
            {/* Wall quote */}
            <div className="hidden md:block">
              <QuoteFrame quote="In my healing era" className="text-xs" />
            </div>
          </div>
          
          {/* Stickers */}
          <div className="mt-4 flex flex-wrap gap-2">
            <StickerDecor text="14 days strong" variant="sage" />
            <StickerDecor text="feeling calm" variant="lavender" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/therapist">
            <Card className="cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">AI Therapist</h3>
                  <p className="text-sm text-muted-foreground">Continue chatting</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/journal">
            <Card className="cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/20 border border-sage/30">
                  <BookOpen className="h-6 w-6 text-moss" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Journal</h3>
                  <p className="text-sm text-muted-foreground">Write an entry</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/affirmations">
            <Card className="cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lavender/20 border border-lavender/30">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Affirmations</h3>
                  <p className="text-sm text-muted-foreground">Daily reminder</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/community">
            <Card className="cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft-blue/20 border border-soft-blue/30">
                  <Users className="h-6 w-6 text-soft-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community</h3>
                  <p className="text-sm text-muted-foreground">Share & connect</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 relative">
          {/* Mood Tracker */}
          <Card className="lg:col-span-2 border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Mood Tracker
                  </CardTitle>
                  <CardDescription>Your emotional journey this week</CardDescription>
                </div>
                <StickerDecor text="progress" variant="sage" className="hidden sm:block" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-40">
                {moodHistory.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-lg">{getMoodEmoji(day.mood)}</span>
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        moodColors[day.mood]
                      )}
                      style={{ height: `${day.value * 20}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {[
                  { mood: "happy", label: "Happy" },
                  { mood: "calm", label: "Calm" },
                  { mood: "neutral", label: "Neutral" },
                  { mood: "sad", label: "Sad" },
                  { mood: "anxious", label: "Anxious" },
                ].map((item) => (
                  <div key={item.mood} className="flex items-center gap-1.5">
                    <div className={cn("h-3 w-3 rounded-full", moodColors[item.mood])} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saved Affirmations */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm relative overflow-hidden">
            <DiffuserDecor className="absolute top-2 right-2 w-10 h-14 opacity-30" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Saved Affirmations
                </CardTitle>
                <Link href="/affirmations">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedAffirmations.map((affirmation, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-warm-cream/50 dark:bg-muted/50 p-3 text-sm leading-relaxed border border-border/40"
                >
                  <span className="text-primary/60">{`"`}</span>
                  {affirmation}
                  <span className="text-primary/60">{`"`}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 relative">
          {/* Books decoration */}
          <BookStackDecor className="absolute -bottom-4 right-4 w-10 h-14 opacity-30 hidden xl:block" />
          
          {/* Recent Journal Entries */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recent Journal Entries
                </CardTitle>
                <Link href="/journal">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentJournalEntries.map((entry) => (
                <Link href="/journal" key={entry.id}>
                  <div className="rounded-xl bg-warm-cream/50 dark:bg-muted/50 p-4 transition-colors hover:bg-muted cursor-pointer border border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      <h4 className="font-medium text-foreground">{entry.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {entry.preview}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
              <Link href="/journal">
                <Button variant="outline" className="w-full rounded-full mt-2 bg-card/50">
                  <BookOpen className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Community Activity */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Community Posts
                </CardTitle>
                <Link href="/community">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentCommunityPosts.length > 0 ? (
                <div className="space-y-3">
                  {recentCommunityPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-xl bg-warm-cream/50 dark:bg-muted/50 p-4 border border-border/40"
                    >
                      <h4 className="font-medium text-foreground">{post.title}</h4>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    You haven&apos;t shared any stories yet.
                  </p>
                </div>
              )}
              <Link href="/community">
                <Button variant="outline" className="w-full rounded-full mt-4 bg-card/50">
                  <Users className="mr-2 h-4 w-4" />
                  Share Your Story
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Continue with AI Therapist */}
        <Card className="mt-6 border-border/40 bg-gradient-to-r from-sage/10 via-card to-lavender/10 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Continue where you left off</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI companion is here whenever you need to talk.
                </p>
              </div>
            </div>
            <Link href="/therapist">
              <Button className="rounded-full shadow-sm shadow-primary/20">
                Open Chat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
