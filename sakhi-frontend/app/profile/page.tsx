"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Heart, 
  Award, 
  Settings, 
  Shield,
  Mail,
  Smartphone,
  Bell,
  Moon,
  Sun,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getMoodEmoji, getMoodLabel } from "@/components/mood-selector"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = React.useState({
    username: "Guest",
    mood: "😊",
    joinDate: new Date(),
    sessionCount: 0,
    email: null as string | null,
    preferences: {
      notifications: true,
      darkMode: false,
      emailUpdates: false
    }
  })

  // Load user data from localStorage
  React.useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    const storedMood = localStorage.getItem("mood_emoji")
    const storedJoinDate = localStorage.getItem("join_date")
    const storedSessions = localStorage.getItem("session_count")
    const storedEmail = localStorage.getItem("user_email")
    
    if (storedUsername) {
      setUserData(prev => ({
        ...prev,
        username: storedUsername,
        mood: storedMood || "😊",
        joinDate: storedJoinDate ? new Date(storedJoinDate) : new Date(),
        sessionCount: parseInt(storedSessions || "0"),
        email: storedEmail
      }))
    } else {
      // Redirect to signin if not authenticated
      router.push("/signin")
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("sakhi_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("username")
    localStorage.removeItem("mood_emoji")
    localStorage.removeItem("join_date")
    localStorage.removeItem("session_count")
    localStorage.removeItem("user_email")
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getDaysAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMembershipLevel = (days: number) => {
    if (days >= 30) return { level: "Gold", color: "bg-yellow-500" }
    if (days >= 14) return { level: "Silver", color: "bg-gray-400" }
    if (days >= 7) return { level: "Bronze", color: "bg-orange-600" }
    return { level: "New", color: "bg-blue-500" }
  }

  const membership = getMembershipLevel(getDaysAgo(userData.joinDate))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {getInitials(userData.username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{userData.username}</h1>
                    <Badge variant="secondary" className={cn("text-white", membership.color)}>
                      {membership.level}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member for {getDaysAgo(userData.joinDate)} days
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {userData.sessionCount} sessions
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{userData.mood}</span>
                      {getMoodLabel(userData.mood)}
                    </div>
                  </div>
                  
                  {userData.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <Mail className="h-4 w-4" />
                      {userData.email}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userData.sessionCount}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-sage" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Journal Entries</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-rose-500" />
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-muted-foreground">Days Streak</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Settings */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Address</div>
                  <div className="text-sm text-muted-foreground">
                    {userData.email || "No email added"}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {userData.email ? "Change" : "Add"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Privacy Settings</div>
                  <div className="text-sm text-muted-foreground">
                    Control your data and visibility
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Get updates on your device
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Updates</div>
                  <div className="text-sm text-muted-foreground">
                    Weekly wellness tips
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Session Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Daily check-in reminders
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                App Settings
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Reduce eye strain in low light
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Sound Effects</div>
                  <div className="text-sm text-muted-foreground">
                    Ambient sounds during sessions
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Language</div>
                  <div className="text-sm text-muted-foreground">
                    English (US)
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Access frequently used features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-between">
                  <span>View Dashboard</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/journal">
                <Button variant="ghost" className="w-full justify-between">
                  <span>My Journal</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/achievements">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Achievements</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-between">
                  <span>Advanced Settings</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
