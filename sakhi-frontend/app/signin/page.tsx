"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ArrowRight, Mail, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoodSelector } from "@/components/mood-selector"
import { DisclaimerModal } from "@/components/disclaimer-modal"
import { Footer } from "@/components/footer"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  FairyLightsDecor,
  BlanketDecor,
  DiffuserDecor
} from "@/components/cozy-aesthetics"

// API URL - change this to your production URL later
const API_URL = "http://127.0.0.1:8000"

export default function SignInPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<"username" | "mood" | "email">("username")
  const [username, setUsername] = React.useState("")
  const [mood, setMood] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [showDisclaimer, setShowDisclaimer] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim().length >= 3) {
      setStep("mood")
      setError("")
    }
  }

  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood)
  }

  const handleMoodContinue = () => {
    if (mood) {
      setShowDisclaimer(true)
    }
  }

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false)
    setStep("email")
  }

  const handleComplete = async (skipEmail: boolean = false) => {
    setIsLoading(true)
    setError("")
    
    try {
      // Call backend to create user/sign in
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          mood_emoji: mood,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Sign in failed")
      }
      
      const data = await response.json()
      
      // Store token and user info in localStorage
      localStorage.setItem("sakhi_token", data.access_token)
      localStorage.setItem("user_id", data.user.id)
      localStorage.setItem("username", data.user.username)
      localStorage.setItem("mood_emoji", mood)
      
      // Store additional user data for persistence
      const existingJoinDate = localStorage.getItem("join_date")
      if (!existingJoinDate) {
        localStorage.setItem("join_date", new Date().toISOString())
      }
      
      // Increment session count
      const currentSessionCount = parseInt(localStorage.getItem("session_count") || "0")
      localStorage.setItem("session_count", (currentSessionCount + 1).toString())
      
      // If user provided email and didn't skip, add it to their account
      if (!skipEmail && email && email.trim()) {
        try {
          const emailResponse = await fetch(`${API_URL}/api/auth/add-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${data.access_token}`,
            },
            body: JSON.stringify({ 
              email: email.trim(),
              password: "temp-recovery-password" // This will be set during proper recovery setup
            }),
          })
          
          if (emailResponse.ok) {
            localStorage.setItem("user_email", email.trim())
          }
        } catch (emailError) {
          console.error("Failed to add email:", emailError)
          // Don't fail the signup if email addition fails
        }
      }
      
      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (err) {
      console.error("Sign-in error:", err)
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.")
      
      // Fallback: create local user if backend is unreachable
      // This ensures the app still works during development
      localStorage.setItem("sakhi_user", JSON.stringify({
        username,
        mood,
        email: skipEmail ? null : email,
        createdAt: new Date().toISOString(),
      }))
      
      // Also create a mock token for local use
      localStorage.setItem("sakhi_token", "mock-token-for-development")
      localStorage.setItem("user_id", `local-${Date.now()}`)
      localStorage.setItem("username", username)
      
      // Still redirect to dashboard
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-warm-cream/60 via-background to-sage/15 cozy-texture relative overflow-hidden">
      {/* Fairy lights at top */}
      <FairyLightsDecor className="absolute top-2 left-0 right-0 w-full h-8 opacity-50" />
      
      {/* Cozy decorations */}
      <PlantDecor className="absolute top-32 left-8 w-16 h-24 opacity-50 animate-sway hidden lg:block" />
      <PlantDecor className="absolute top-48 right-12 w-14 h-20 opacity-40 animate-sway hidden lg:block" />
      <DiffuserDecor className="absolute top-36 right-32 w-12 h-18 opacity-40 hidden xl:block" />
      <BlanketDecor className="absolute bottom-32 left-8 w-24 h-14 opacity-30 hidden lg:block" />
      <BlanketDecor className="absolute bottom-40 right-12 w-20 h-12 opacity-25 hidden lg:block" />
      
      {/* Wall quotes */}
      <div className="absolute top-28 left-1/4 hidden xl:block">
        <QuoteFrame quote="Welcome home" className="text-xs rotate-[-2deg]" />
      </div>
      <div className="absolute top-36 right-1/4 hidden xl:block">
        <QuoteFrame quote="You belong here" className="text-xs rotate-[1deg]" />
      </div>
      
      {/* Header */}
      <header className="container relative mx-auto flex items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Heart className="h-4 w-4 text-primary" />
            <Leaf className="absolute -top-1 -right-1 h-3 w-3 text-sage rotate-45" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Sakhi</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4 relative">
        <Card className="w-full max-w-md border-border/40 shadow-xl bg-card/90 backdrop-blur-sm">
          {/* Step 1: Username */}
          {step === "username" && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <StickerDecor text="welcome" variant="sage" />
                </div>
                <CardTitle className="font-serif text-2xl">Create Your Space</CardTitle>
                <CardDescription>
                  Choose an anonymous username. No personal info required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUsernameSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Anonymous Username</Label>
                    <Input
                      id="username"
                      placeholder="e.g., HealingSoul_42"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="rounded-xl bg-warm-cream/50 dark:bg-muted/50 border-border/40"
                      minLength={3}
                      maxLength={20}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      3-20 characters. This will be your identity in the community.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full shadow-sm shadow-primary/20"
                    disabled={username.trim().length < 3}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button className="text-primary hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Mood Selection */}
          {step === "mood" && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <StickerDecor text="check-in" variant="lavender" />
                </div>
                <CardTitle className="font-serif text-2xl">How Are You Feeling?</CardTitle>
                <CardDescription>
                  Select an emoji that represents your current mood.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <MoodSelector value={mood} onChange={handleMoodSelect} size="lg" />

                <div className="pt-4">
                  <Button
                    onClick={handleMoodContinue}
                    className="w-full rounded-full shadow-sm shadow-primary/20"
                    disabled={!mood}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <button
                  onClick={() => setStep("username")}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  Go back
                </button>
              </CardContent>
            </>
          )}

          {/* Step 3: Optional Email */}
          {step === "email" && (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  <StickerDecor text="almost there" variant="rose" />
                </div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20 border-2 border-sage/30">
                  <Mail className="h-8 w-8 text-moss" />
                </div>
                <CardTitle className="font-serif text-2xl">Almost There!</CardTitle>
                <CardDescription>
                  Add an email for account recovery (optional).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Recovery Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl bg-warm-cream/50 dark:bg-muted/50 border-border/40"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only used for account recovery. We never spam.
                  </p>
                </div>

                <Button
                  onClick={() => handleComplete(false)}
                  className="w-full rounded-full shadow-sm shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating your space..." : "Complete Setup"}
                </Button>

                <button
                  onClick={() => handleComplete(true)}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  Skip for now
                </button>
              </CardContent>
            </>
          )}
        </Card>
      </main>

      <Footer />

      {/* Disclaimer Modal */}
      <DisclaimerModal open={showDisclaimer} onAccept={handleDisclaimerAccept} />
    </div>
  )
}