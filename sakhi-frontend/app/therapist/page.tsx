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

const aiResponses: Record<string, string> = {
  default: "I'm here to listen and support you. Whatever you're feeling right now is valid. Take a moment to breathe, and when you're ready, share what's on your mind. There's no rush, and no judgment here.",
  grounding: "Let's try a grounding exercise together. Look around and name:\n\n• 5 things you can see\n• 4 things you can touch\n• 3 things you can hear\n• 2 things you can smell\n• 1 thing you can taste\n\nTake your time with each one. This helps bring you back to the present moment.",
  anxious: "I hear that you're feeling anxious. That feeling is real, and it's okay to feel this way. Anxiety often lives in our thoughts about the future. Let's try to come back to this present moment together.\n\nWould you like to try a breathing exercise, or would you prefer to talk about what's causing these feelings?",
  talk: "I'm here, and I'm listening. You can share as much or as little as you'd like. Sometimes just putting thoughts into words can help us understand them better.\n\nWhat's been on your mind?",
  greeting: "Hello! I'm your compassionate AI companion. I'm here to listen, support, and walk alongside you on your wellness journey.\n\nRemember: while I'm here to help you process feelings and provide support, I'm not a replacement for professional mental health care. If you're in crisis, please reach out to emergency services.\n\nHow are you feeling today?",
}

export default function TherapistPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: aiResponses.greeting,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [showCrisisAlert, setShowCrisisAlert] = React.useState(false)
  const [showBreathingGuide, setShowBreathingGuide] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

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

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes("breath") || lowerMessage.includes("breathing")) {
      return "Taking deep breaths can really help calm our nervous system. Would you like me to guide you through a 4-7-8 breathing exercise? It's a simple but powerful technique.\n\nClick the 'Help me breathe' button below to start the guided exercise."
    }
    
    if (lowerMessage.includes("ground") || lowerMessage.includes("present")) {
      return aiResponses.grounding
    }
    
    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety") || lowerMessage.includes("worried")) {
      return aiResponses.anxious
    }
    
    if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("hopeless")) {
      return "It takes courage to acknowledge these feelings. Sadness and low moods are part of being human, though I know they can feel overwhelming.\n\nYou don't have to face this alone. I'm here with you right now. Would you like to share more about what's been weighing on you?"
    }
    
    if (lowerMessage.includes("thank")) {
      return "You're very welcome. Remember, reaching out is a sign of strength. I'm here whenever you need to talk. Is there anything else on your mind?"
    }
    
    // Default supportive response
    return "Thank you for sharing that with me. Your feelings are valid, and I appreciate you trusting me with them.\n\nCan you tell me more about what's been on your mind? Sometimes exploring our thoughts out loud can help us understand them better."
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
    setInput("")

    // Check for crisis keywords
    if (checkForCrisis(userMessage.content)) {
      setShowCrisisAlert(true)
    }

    // Simulate AI typing
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getAIResponse(userMessage.content),
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, aiResponse])
  }

  const handleQuickAction = (action: string) => {
    if (action === "breathing") {
      setShowBreathingGuide(true)
    } else {
      const response = aiResponses[action] || aiResponses.default
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }
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

      <Footer />

      {/* Modals */}
      <CrisisAlert open={showCrisisAlert} onOpenChange={setShowCrisisAlert} />
      <BreathingGuideModal open={showBreathingGuide} onOpenChange={setShowBreathingGuide} />
    </div>
  )
}
