"use client"

import * as React from "react"
import { Heart, Send, AlertTriangle, Wind, MessageCircle, Frown, HelpCircle, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CrisisAlert } from "@/components/crisis-alert"
import { BreathingGuideModal } from "@/components/breathing-guide-modal"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  BlanketDecor,
  DiffuserDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickActions = [
  { icon: Wind, label: "Help me breathe", action: "breathing" },
  { icon: HelpCircle, label: "I need grounding exercises", action: "grounding" },
  { icon: Frown, label: "I'm feeling anxious", action: "anxious" },
  { icon: MessageCircle, label: "I need to talk", action: "talk" },
]

const crisisKeywords = ["suicide", "kill myself", "end my life", "want to die", "self harm", "hurt myself"]

// API URL - change this to your production URL later
const API_URL = "http://127.0.0.1:8000"

// Greeting message (only mock left, everything else comes from backend)
const greetingMessage = "Hello! I'm your compassionate AI companion. I'm here to listen, support, and walk alongside you on your wellness journey.\n\nRemember: while I'm here to help you process feelings and provide support, I'm not a replacement for professional mental health care. If you're in crisis, please reach out to emergency services.\n\nHow are you feeling today?"

export default function TherapistPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: greetingMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [showCrisisAlert, setShowCrisisAlert] = React.useState(false)
  const [showBreathingGuide, setShowBreathingGuide] = React.useState(false)
  const [isAuthenticating, setIsAuthenticating] = React.useState(true)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Get user data from localStorage (set during signin)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [username, setUsername] = React.useState<string | null>(null)
  const [token, setToken] = React.useState<string | null>(null)

  // Load user data on component mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem("sakhi_token")
    const storedUserId = localStorage.getItem("user_id")
    const storedUsername = localStorage.getItem("username")
    
    if (storedToken) setToken(storedToken)
    if (storedUserId) setUserId(storedUserId)
    if (storedUsername) setUsername(storedUsername)
    
    // Redirect to signin if no token exists
    if (!storedToken) {
      window.location.href = "/signin"
    } else {
      setIsAuthenticating(false)
    }
  }, [])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkForCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase()
    return crisisKeywords.some((keyword) => lowerText.includes(keyword))
  }

  // NEW: Call backend API instead of using mock responses
  const getAIResponseFromBackend = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.log("Token expired or invalid, redirecting to signin...")
          localStorage.removeItem("sakhi_token")
          localStorage.removeItem("user_id") 
          localStorage.removeItem("username")
          window.location.href = "/signin"
          return "Please sign in to continue chatting."
        }
        
        throw new Error(`API error: ${response.status} - ${errorData.detail || 'Unknown error'}`)
      }

      const data = await response.json()
      
      // Check if this is a crisis response
      if (data.is_crisis && data.crisis_resources) {
        setShowCrisisAlert(true)
      }
      
      // If there's a suggested breathing exercise, we could trigger it here
      if (data.suggested_exercise) {
        // Optional: auto-show breathing guide for certain responses
        // setShowBreathingGuide(true)
      }
      
      return data.response
      
    } catch (error) {
      console.error("Error calling AI backend:", error)
      // Fallback message if backend is unreachable
      return "I'm here with you. Tell me more about what you're feeling. 💜"
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input.trim()
    setInput("")

    // Check for crisis keywords
    if (checkForCrisis(userInput)) {
      setShowCrisisAlert(true)
    }

    // Show typing indicator
    setIsTyping(true)
    
    // Call backend API
    const aiResponseContent = await getAIResponseFromBackend(userInput)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, aiMessage])
  }

  const handleQuickAction = async (action: string) => {
    if (action === "breathing") {
      setShowBreathingGuide(true)
      return
    }
    
    // Map quick actions to natural language messages
    let quickMessage = ""
    switch (action) {
      case "grounding":
        quickMessage = "I need grounding exercises. Can you help me feel more present?"
        break
      case "anxious":
        quickMessage = "I'm feeling anxious right now and need support."
        break
      case "talk":
        quickMessage = "I need someone to talk to. Can you listen?"
        break
      default:
        quickMessage = "I need some support right now."
    }
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: quickMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    
    // Show typing indicator
    setIsTyping(true)
    
    // Get AI response
    const aiResponseContent = await getAIResponseFromBackend(quickMessage)
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date(),
    }
    
    setIsTyping(false)
    setMessages((prev) => [...prev, aiMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture">
      <Navbar />

      {isAuthenticating ? (
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying your session...</p>
          </div>
        </main>
      ) : (
        <main className="container mx-auto flex flex-1 flex-col gap-4 p-4 md:p-6 relative">
        {/* Cozy decorations */}
        <PlantDecor className="absolute top-4 left-4 w-12 h-16 opacity-40 animate-sway hidden lg:block" />
        <CandleDecor className="absolute top-8 right-4 w-8 h-14 opacity-40 hidden lg:block" />
        <DiffuserDecor className="absolute bottom-32 left-4 w-10 h-14 opacity-30 hidden xl:block" />
        <BlanketDecor className="absolute bottom-20 right-4 w-20 h-12 opacity-30 hidden xl:block" />
        
        {/* Wall quote */}
        <div className="hidden lg:block absolute top-4 left-1/2 -translate-x-1/2">
          <QuoteFrame quote="You are safe here" className="text-xs" />
        </div>
        
        {/* Emergency Button and Stickers */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <StickerDecor text="safe space" variant="sage" className="hidden sm:block" />
            <StickerDecor text="no judgment" variant="lavender" className="hidden sm:block" />
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowCrisisAlert(true)}
            className="rounded-full"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Emergency Help
          </Button>
        </div>

        {/* Chat Container */}
        <Card className="flex flex-1 flex-col overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-warm-cream dark:bg-muted border border-border/40"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                          <Heart className="h-3 w-3 text-primary" />
                          <Leaf className="absolute -top-0.5 -right-0.5 h-2 w-2 text-sage rotate-45" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Sakhi
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-warm-cream dark:bg-muted px-4 py-3 border border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        <Heart className="h-3 w-3 text-primary animate-gentle-pulse" />
                      </div>
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t border-border/40 bg-warm-cream/30 dark:bg-muted/30 p-3">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.action)}
                  className="rounded-full text-xs bg-card/80 hover:bg-card"
                >
                  <action.icon className="mr-1.5 h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <CardContent className="border-t border-border/40 p-4 bg-card/50">
            <div className="flex gap-3">
              <Textarea
                placeholder="Share what's on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none rounded-xl bg-warm-cream/50 dark:bg-muted/50 border-border/40"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="h-auto rounded-xl px-4 shadow-sm shadow-primary/20"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </main>
      )}

      <Footer />

      {/* Modals */}
      <CrisisAlert open={showCrisisAlert} onOpenChange={setShowCrisisAlert} />
      <BreathingGuideModal open={showBreathingGuide} onOpenChange={setShowBreathingGuide} />
    </div>
  )
}