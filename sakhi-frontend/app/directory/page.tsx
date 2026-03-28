"use client"

import * as React from "react"
import { Star, Filter, CheckCircle, Calendar, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  PlantDecor, 
  CandleDecor, 
  QuoteFrame, 
  StickerDecor,
  FairyLightsDecor,
  DiffuserDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"

interface Therapist {
  id: string
  name: string
  credentials: string
  photo: string
  specialties: string[]
  rating: number
  reviewCount: number
  price: number
  availability: string
  bio: string
  yearsExperience: number
  isVerified: boolean
}

const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    credentials: "Ph.D., LCSW",
    photo: "",
    specialties: ["Anxiety", "Depression", "Trauma"],
    rating: 4.9,
    reviewCount: 127,
    price: 150,
    availability: "Available this week",
    bio: "I specialize in helping individuals navigate anxiety, depression, and trauma. My approach combines cognitive-behavioral therapy with mindfulness techniques to help you develop lasting coping skills. I believe in creating a warm, non-judgmental space where you can explore your thoughts and feelings at your own pace.",
    yearsExperience: 12,
    isVerified: true,
  },
  {
    id: "2",
    name: "Dr. Michael Torres",
    credentials: "Psy.D., LPC",
    photo: "",
    specialties: ["Relationships", "Self-Esteem", "Life Transitions"],
    rating: 4.8,
    reviewCount: 89,
    price: 130,
    availability: "Available next week",
    bio: "I help people navigate life's transitions, improve their relationships, and build self-confidence. Whether you're dealing with career changes, relationship issues, or personal growth, I'm here to support you with evidence-based approaches tailored to your unique needs.",
    yearsExperience: 8,
    isVerified: true,
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    credentials: "Ph.D., Licensed Psychologist",
    photo: "",
    specialties: ["PTSD", "Grief", "Anxiety"],
    rating: 4.9,
    reviewCount: 156,
    price: 175,
    availability: "Limited availability",
    bio: "As a trauma specialist, I help individuals process difficult experiences and find healing. I use EMDR and trauma-focused CBT to help you move forward. My practice is rooted in compassion and the belief that everyone has the capacity for growth and resilience.",
    yearsExperience: 15,
    isVerified: true,
  },
  {
    id: "4",
    name: "James Rodriguez",
    credentials: "LMFT",
    photo: "",
    specialties: ["Couples Therapy", "Family", "Communication"],
    rating: 4.7,
    reviewCount: 72,
    price: 120,
    availability: "Available this week",
    bio: "I specialize in helping couples and families improve communication and strengthen their bonds. Whether you're facing conflict, considering major life decisions together, or simply want to deepen your connection, I provide a supportive environment for growth.",
    yearsExperience: 10,
    isVerified: true,
  },
  {
    id: "5",
    name: "Dr. Aisha Patel",
    credentials: "Ph.D., Clinical Psychologist",
    photo: "",
    specialties: ["Cultural Identity", "Anxiety", "Depression"],
    rating: 4.8,
    reviewCount: 94,
    price: 160,
    availability: "Available this week",
    bio: "I provide culturally sensitive therapy for individuals navigating identity, belonging, and mental health challenges. I understand the unique pressures that come from cultural expectations and help clients find balance between their heritage and personal growth.",
    yearsExperience: 11,
    isVerified: true,
  },
  {
    id: "6",
    name: "David Kim",
    credentials: "LCSW",
    photo: "",
    specialties: ["Stress Management", "Work-Life Balance", "Burnout"],
    rating: 4.6,
    reviewCount: 68,
    price: 110,
    availability: "Available next week",
    bio: "I help professionals manage stress, prevent burnout, and create sustainable work-life balance. Using practical, solution-focused techniques, I'll help you develop strategies that work within your busy lifestyle.",
    yearsExperience: 7,
    isVerified: true,
  },
]

const specialties = [
  "Anxiety",
  "Depression",
  "Trauma",
  "PTSD",
  "Relationships",
  "Self-Esteem",
  "Grief",
  "Stress Management",
  "Cultural Identity",
]

const priceRanges = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $150", min: 100, max: 150 },
  { label: "$150 - $200", min: 150, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
]

export default function DirectoryPage() {
  const [selectedTherapist, setSelectedTherapist] = React.useState<Therapist | null>(null)
  const [showBookingModal, setShowBookingModal] = React.useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<string>("")
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredTherapists = therapists.filter((therapist) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = therapist.name.toLowerCase().includes(query)
      const matchesSpecialty = therapist.specialties.some((s) =>
        s.toLowerCase().includes(query)
      )
      if (!matchesName && !matchesSpecialty) return false
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      const hasMatchingSpecialty = selectedSpecialties.some((specialty) =>
        therapist.specialties.includes(specialty)
      )
      if (!hasMatchingSpecialty) return false
    }

    // Price filter
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.label === selectedPriceRange)
      if (range && (therapist.price < range.min || therapist.price > range.max)) {
        return false
      }
    }

    return true
  })

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    )
  }

  const clearFilters = () => {
    setSelectedSpecialties([])
    setSelectedPriceRange("")
    setSearchQuery("")
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture relative overflow-hidden">
      {/* Cozy decorations */}
      <FairyLightsDecor className="absolute top-16 left-0 right-0 w-full h-8 opacity-40 hidden lg:block" />
      <PlantDecor className="absolute top-32 right-4 w-12 h-16 opacity-40 animate-sway hidden xl:block" />
      <CandleDecor className="absolute top-48 right-12 w-8 h-12 opacity-30 hidden xl:block" />
      <DiffuserDecor className="absolute bottom-40 left-4 w-10 h-14 opacity-30 hidden xl:block" />
      
      {/* Wall quote */}
      <div className="absolute top-28 left-1/4 hidden xl:block">
        <QuoteFrame quote="Help is here" className="text-xs rotate-[-1deg]" />
      </div>
      
      <Navbar />

      <main className="container mx-auto flex-1 p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <StickerDecor text="verified" variant="sage" />
            <StickerDecor text="professionals" variant="lavender" className="hidden sm:block" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Find a Therapist
          </h1>
          <p className="mt-2 text-muted-foreground">
            Connect with licensed, verified mental health professionals.
          </p>
        </div>

        {/* Verification Notice */}
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-sage/20 p-4 text-sm">
          <CheckCircle className="h-5 w-5 text-secondary-foreground" />
          <span className="text-foreground">
            All therapists on Sakhi are licensed and verified professionals.
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters - Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64">
            <Card className="sticky top-24 border-border/40">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {(selectedSpecialties.length > 0 || selectedPriceRange) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="Name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  {specialties.map((specialty) => (
                    <div key={specialty} className="flex items-center gap-2">
                      <Checkbox
                        id={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={() => toggleSpecialty(specialty)}
                      />
                      <label
                        htmlFor={specialty}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filter Sheet */}
          <div className="flex items-center justify-between lg:hidden">
            <p className="text-sm text-muted-foreground">
              {filteredTherapists.length} therapists found
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down your search</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      placeholder="Name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range.label} value={range.label}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(selectedSpecialties.length > 0 || selectedPriceRange) && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Therapist Grid */}
          <div className="flex-1">
            <div className="hidden lg:block mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredTherapists.length} therapists found
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTherapists.map((therapist) => (
                <Card
                  key={therapist.id}
                  className="cursor-pointer border-border/40 transition-all hover:shadow-lg hover:border-primary/20"
                  onClick={() => setSelectedTherapist(therapist)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={therapist.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {therapist.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{therapist.name}</h3>
                          {therapist.isVerified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{therapist.credentials}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {therapist.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {renderStars(therapist.rating)}
                        <span className="text-sm text-muted-foreground">
                          ({therapist.reviewCount})
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        ${therapist.price}/session
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {therapist.availability}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Therapist Profile Modal */}
        <Dialog open={!!selectedTherapist} onOpenChange={() => setSelectedTherapist(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            {selectedTherapist && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedTherapist.photo} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {selectedTherapist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl">{selectedTherapist.name}</DialogTitle>
                        {selectedTherapist.isVerified && (
                          <Badge className="bg-primary/10 text-primary">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{selectedTherapist.credentials}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {renderStars(selectedTherapist.rating)}
                        <span className="text-sm text-muted-foreground">
                          {selectedTherapist.rating} ({selectedTherapist.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Specialties */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">About</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedTherapist.bio}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-semibold">{selectedTherapist.yearsExperience} years</p>
                    </div>
                    <div className="rounded-xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Session Price</p>
                      <p className="font-semibold">${selectedTherapist.price}</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{selectedTherapist.availability}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedTherapist(null)
                    setShowBookingModal(true)
                  }}
                  className="w-full rounded-full"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Session
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book a Session</DialogTitle>
              <DialogDescription>
                Choose a time that works for you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Input type="date" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9am">9:00 AM</SelectItem>
                    <SelectItem value="10am">10:00 AM</SelectItem>
                    <SelectItem value="11am">11:00 AM</SelectItem>
                    <SelectItem value="2pm">2:00 PM</SelectItem>
                    <SelectItem value="3pm">3:00 PM</SelectItem>
                    <SelectItem value="4pm">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brief description of what you&apos;d like to discuss</Label>
                <Input
                  placeholder="Optional: Share what's on your mind..."
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button className="w-full rounded-full">
              Confirm Booking
            </Button>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  )
}
