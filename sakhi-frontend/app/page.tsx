import Link from "next/link"
import { ArrowRight, MessageCircle, Users, BookOpen, Sparkles, Shield, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  PlantDecor, 
  CandleDecor, 
  ClockDecor, 
  QuoteFrame, 
  SandTimerDecor,
  BlanketDecor,
  StickerDecor,
  FairyLightsDecor,
  BookStackDecor,
  DiffuserDecor,
  RugDecor
} from "@/components/cozy-aesthetics"

const features = [
  {
    icon: MessageCircle,
    title: "AI Companion",
    description: "Talk to a compassionate AI that listens without judgment and helps you process your thoughts and feelings.",
  },
  {
    icon: Users,
    title: "Anonymous Community",
    description: "Share your story and read others' experiences. You're not alone in this journey.",
  },
  {
    icon: BookOpen,
    title: "Private Journal",
    description: "Document your thoughts and track your emotional journey in a secure, encrypted space.",
  },
  {
    icon: Sparkles,
    title: "Daily Affirmations",
    description: "Start each day with personalized positive affirmations to nurture your self-worth.",
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "Your anonymity is protected. No personal data required to begin your healing journey.",
  },
  {
    icon: Heart,
    title: "Professional Support",
    description: "When you're ready, connect with licensed therapists who truly understand.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col cozy-texture">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Cozy warm background */}
          <div className="absolute inset-0 bg-gradient-to-b from-warm-cream/50 via-background to-sage/10" />
          
          {/* Fairy lights at top */}
          <FairyLightsDecor className="absolute top-4 left-0 right-0 w-full h-8 opacity-60" />
          
          {/* Decorative elements */}
          <PlantDecor className="absolute top-32 left-8 w-16 h-24 opacity-70 animate-sway hidden lg:block" />
          <PlantDecor className="absolute top-40 right-12 w-14 h-20 opacity-60 animate-sway hidden lg:block" style={{ animationDelay: "1s" }} />
          <CandleDecor className="absolute top-48 left-28 w-10 h-16 opacity-50 hidden xl:block" />
          <DiffuserDecor className="absolute top-44 right-32 w-12 h-18 opacity-50 hidden xl:block" />
          <ClockDecor className="absolute top-24 right-48 w-14 h-14 opacity-40 hidden xl:block" />
          
          {/* Wall quotes */}
          <div className="absolute top-28 left-1/4 hidden lg:block">
            <QuoteFrame quote="In my healing era" className="text-xs rotate-[-3deg] animate-float-slow" />
          </div>
          <div className="absolute top-36 right-1/4 hidden lg:block">
            <QuoteFrame quote="Soft life, soft heart" className="text-xs rotate-[2deg] animate-float-slow" style={{ animationDelay: "2s" }} />
          </div>
          
          {/* Sand timer */}
          <SandTimerDecor className="absolute bottom-32 left-16 w-10 h-16 opacity-50 hidden lg:block" />
          
          {/* Books and blanket */}
          <BookStackDecor className="absolute bottom-24 right-20 w-14 h-18 opacity-50 hidden xl:block" />
          <BlanketDecor className="absolute bottom-16 right-8 w-24 h-14 opacity-40 hidden lg:block" />
          
          {/* Rug at bottom */}
          <RugDecor className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 opacity-30 hidden md:block" />
          
          <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-3xl text-center">
              {/* Stickers */}
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                <StickerDecor text="safe space" variant="sage" />
                <StickerDecor text="no judgment" variant="lavender" />
                <StickerDecor text="healing vibes" variant="rose" />
              </div>
              
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary border border-primary/20">
                <Heart className="h-4 w-4" />
                <span>Your cozy corner for mental wellness</span>
              </div>
              
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                Your Safe Space for Healing
              </h1>
              
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl text-pretty">
                Anonymously. Compassionately. Always.
              </p>
              
              <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                Sakhi is your gentle companion on the path to mental wellness. 
                Whether you need someone to talk to, a community that understands, 
                or simply a moment of peace, we&apos;re here for you.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signin">
                  <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/therapist">
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-base bg-card/80 backdrop-blur-sm">
                    Talk to AI Companion
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-t border-border/40 bg-card/50 py-20 md:py-28">
          {/* Corner decorations */}
          <PlantDecor className="absolute top-8 left-8 w-12 h-16 opacity-40 animate-sway hidden lg:block" />
          <CandleDecor className="absolute top-12 right-12 w-8 h-14 opacity-40 hidden lg:block" />
          
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 flex justify-center gap-2">
                <StickerDecor text="self-care toolkit" variant="cream" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Everything You Need to Heal
              </h2>
              <p className="mt-4 text-muted-foreground">
                A complete toolkit designed with empathy to support your mental wellness journey.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative py-20 md:py-28">
          {/* Decorative elements */}
          <SandTimerDecor className="absolute top-16 left-12 w-8 h-14 opacity-30 hidden lg:block" />
          <BookStackDecor className="absolute bottom-20 right-16 w-12 h-16 opacity-30 hidden lg:block" />
          
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 flex justify-center gap-2">
                <StickerDecor text="getting started" variant="sage" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                How Sakhi Supports You
              </h2>
              <p className="mt-4 text-muted-foreground">
                Simple steps to begin your healing journey.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create Your Space",
                  description: "Sign in anonymously with just a username. No email required. Your privacy is our priority.",
                },
                {
                  step: "02",
                  title: "Express Yourself",
                  description: "Talk to our AI companion, journal your thoughts, or connect with the community.",
                },
                {
                  step: "03",
                  title: "Grow & Heal",
                  description: "Track your progress, read daily affirmations, and when ready, connect with professional help.",
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                    <span className="font-serif text-xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-warm-cream/30 to-lavender/10" />
          
          {/* Cozy decorations */}
          <FairyLightsDecor className="absolute top-0 left-0 right-0 w-full h-6 opacity-50" />
          <PlantDecor className="absolute bottom-0 left-12 w-16 h-20 opacity-50 animate-sway hidden lg:block" />
          <BlanketDecor className="absolute bottom-4 right-8 w-20 h-12 opacity-40 hidden lg:block" />
          
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-3xl bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm border border-border/40 md:p-12">
              {/* Quote on the card */}
              <QuoteFrame quote="Every journey begins with a single step" className="mx-auto mb-6 inline-block text-xs" />
              
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                Your Healing Journey Starts Here
              </h2>
              <p className="mt-4 text-muted-foreground">
                Take the first step. We&apos;re here to walk beside you.
              </p>
              <Link href="/signin">
                <Button size="lg" className="mt-8 rounded-full px-10 text-base shadow-lg shadow-primary/20">
                  Begin Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
