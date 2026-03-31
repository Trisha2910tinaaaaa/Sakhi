"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  Calendar,
  MessageCircle,
  BookOpen,
  Award,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const router = useRouter()
  const [userData, setUserData] = React.useState({
    username: "Guest",
    mood: "😊",
    joinDate: new Date(),
    sessionCount: 0
  })

  // Load user data from localStorage
  React.useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    const storedMood = localStorage.getItem("mood_emoji")
    const storedJoinDate = localStorage.getItem("join_date")
    const storedSessions = localStorage.getItem("session_count")
    
    if (storedUsername) {
      setUserData(prev => ({
        ...prev,
        username: storedUsername,
        mood: storedMood || "😊",
        joinDate: storedJoinDate ? new Date(storedJoinDate) : new Date(),
        sessionCount: parseInt(storedSessions || "0")
      }))
    }
  }, [])

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem("sakhi_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("username")
    localStorage.removeItem("mood_emoji")
    localStorage.removeItem("join_date")
    localStorage.removeItem("session_count")
    
    // Redirect to home
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

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-auto p-1 rounded-full hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(userData.username)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {userData.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {userData.mood} {getDaysAgo(userData.joinDate)} days
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64 bg-card/95 backdrop-blur-lg border-border/40" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userData.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Member for {getDaysAgo(userData.joinDate)} days
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <Heart className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/therapist" className="flex items-center gap-2 cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              <span>AI Therapist</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/journal" className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-4 w-4" />
              <span>My Journal</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/achievements" className="flex items-center gap-2 cursor-pointer">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
