"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Award, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  Users, 
  Star,
  Trophy,
  Target,
  Zap,
  Lock,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  isUnlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedAt?: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function AchievementsPage() {
  const router = useRouter()
  const [userData, setUserData] = React.useState({
    username: "Guest",
    joinDate: new Date(),
    sessionCount: 0,
    achievements: [] as string[]
  })

  // Load user data from localStorage
  React.useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    const storedJoinDate = localStorage.getItem("join_date")
    const storedSessions = localStorage.getItem("session_count")
    const storedAchievements = localStorage.getItem("achievements")
    
    if (storedUsername) {
      setUserData(prev => ({
        ...prev,
        username: storedUsername,
        joinDate: storedJoinDate ? new Date(storedJoinDate) : new Date(),
        sessionCount: parseInt(storedSessions || "0"),
        achievements: storedAchievements ? JSON.parse(storedAchievements) : []
      }))
    } else {
      router.push("/signin")
    }
  }, [router])

  const achievements: Achievement[] = [
    // First Steps
    {
      id: "first_session",
      title: "First Steps",
      description: "Complete your first AI therapy session",
      icon: <MessageCircle className="h-6 w-6" />,
      category: "Milestones",
      isUnlocked: userData.sessionCount >= 1,
      rarity: "common"
    },
    {
      id: "week_warrior",
      title: "Week Warrior",
      description: "Use Sakhi for 7 consecutive days",
      icon: <Calendar className="h-6 w-6" />,
      category: "Consistency",
      isUnlocked: false, // Would need streak tracking
      progress: 3,
      maxProgress: 7,
      rarity: "common"
    },
    {
      id: "monthly_member",
      title: "Monthly Member",
      description: "Active for 30 days",
      icon: <Heart className="h-6 w-6" />,
      category: "Milestones",
      isUnlocked: false, // Would need proper date calculation
      rarity: "rare"
    },
    
    // Communication
    {
      id: "conversation_starter",
      title: "Conversation Starter",
      description: "Send 10 messages to AI therapist",
      icon: <MessageCircle className="h-6 w-6" />,
      category: "Communication",
      isUnlocked: userData.sessionCount >= 10,
      progress: Math.min(userData.sessionCount, 10),
      maxProgress: 10,
      rarity: "common"
    },
    {
      id: "deep_talker",
      title: "Deep Talker",
      description: "Have 50 meaningful conversations",
      icon: <Heart className="h-6 w-6" />,
      category: "Communication",
      isUnlocked: userData.sessionCount >= 50,
      progress: Math.min(userData.sessionCount, 50),
      maxProgress: 50,
      rarity: "epic"
    },
    
    // Journal
    {
      id: "first_entry",
      title: "First Entry",
      description: "Write your first journal entry",
      icon: <BookOpen className="h-6 w-6" />,
      category: "Journal",
      isUnlocked: false, // Would need journal tracking
      rarity: "common"
    },
    {
      id: "journal_keeper",
      title: "Journal Keeper",
      description: "Write 10 journal entries",
      icon: <BookOpen className="h-6 w-6" />,
      category: "Journal",
      isUnlocked: false,
      progress: 2,
      maxProgress: 10,
      rarity: "rare"
    },
    
    // Social
    {
      id: "community_member",
      title: "Community Member",
      description: "Join the community forum",
      icon: <Users className="h-6 w-6" />,
      category: "Social",
      isUnlocked: false,
      rarity: "common"
    },
    {
      id: "helping_hand",
      title: "Helping Hand",
      description: "Support 5 community members",
      icon: <Heart className="h-6 w-6" />,
      category: "Social",
      isUnlocked: false,
      rarity: "rare"
    },
    
    // Special
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Be one of the first 1000 users",
      icon: <Star className="h-6 w-6" />,
      category: "Special",
      isUnlocked: true, // Would need actual check
      rarity: "legendary"
    },
    {
      id: "crisis_helper",
      title: "Crisis Helper",
      description: "Access crisis resources when needed",
      icon: <Target className="h-6 w-6" />,
      category: "Safety",
      isUnlocked: false,
      rarity: "epic"
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-400 bg-gray-50"
      case "rare": return "border-blue-400 bg-blue-50"
      case "epic": return "border-purple-400 bg-purple-50"
      case "legendary": return "border-amber-400 bg-amber-50"
      default: return "border-gray-400 bg-gray-50"
    }
  }

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-400 text-white"
      case "rare": return "bg-blue-500 text-white"
      case "epic": return "bg-purple-500 text-white"
      case "legendary": return "bg-amber-500 text-white"
      default: return "bg-gray-400 text-white"
    }
  }

  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalCount = achievements.length
  const completionPercentage = (unlockedCount / totalCount) * 100

  const categories = [...new Set(achievements.map(a => a.category))]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Trophy className="h-8 w-8 text-amber-500" />
                Achievements
              </h1>
              <p className="text-muted-foreground">
                Track your wellness journey and unlock milestones
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{unlockedCount}/{totalCount}</div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="w-32">
                <Progress value={completionPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(completionPercentage)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">{unlockedCount}</div>
              <div className="text-sm text-muted-foreground">Total Achievements</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {achievements.filter(a => a.isUnlocked && a.rarity === "epic").length}
              </div>
              <div className="text-sm text-muted-foreground">Epic Unlocked</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold">
                {achievements.filter(a => a.isUnlocked && a.rarity === "legendary").length}
              </div>
              <div className="text-sm text-muted-foreground">Legendary Unlocked</div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userData.sessionCount}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements by Category */}
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              {category === "Milestones" && <Target className="h-5 w-5" />}
              {category === "Communication" && <MessageCircle className="h-5 w-5" />}
              {category === "Journal" && <BookOpen className="h-5 w-5" />}
              {category === "Social" && <Users className="h-5 w-5" />}
              {category === "Safety" && <Heart className="h-5 w-5" />}
              {category === "Special" && <Star className="h-5 w-5" />}
              {category}
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements
                .filter(achievement => achievement.category === category)
                .map(achievement => (
                  <Card 
                    key={achievement.id}
                    className={cn(
                      "border-2 transition-all hover:shadow-md",
                      achievement.isUnlocked 
                        ? getRarityColor(achievement.rarity)
                        : "border-border/40 bg-muted/30 opacity-75"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "p-2 rounded-full",
                          achievement.isUnlocked ? "bg-primary/10" : "bg-muted"
                        )}>
                          {achievement.isUnlocked ? (
                            <div className="text-primary">
                              {achievement.icon}
                            </div>
                          ) : (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            getRarityBadgeColor(achievement.rarity)
                          )}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-base flex items-center gap-2">
                        {achievement.title}
                        {achievement.isUnlocked && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && !achievement.isUnlocked && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1"
                          />
                        </div>
                      </CardContent>
                    )}
                    
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Call to Action */}
        <Card className="border-border/40 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Keep Going!</h3>
            <p className="text-muted-foreground mb-4">
              You're doing great! Continue your wellness journey to unlock more achievements.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/therapist">
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              </Link>
              <Link href="/journal">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Write Journal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
