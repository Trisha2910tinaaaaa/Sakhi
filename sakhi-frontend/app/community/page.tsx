"use client"

import * as React from "react"
import { Plus, Heart, MessageCircle, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  BlanketDecor
} from "@/components/cozy-aesthetics"
import { cn } from "@/lib/utils"

const categories = [
  { value: "all", label: "All Stories" },
  { value: "depression", label: "Depression" },
  { value: "anxiety", label: "Anxiety" },
  { value: "recovery", label: "Recovery Wins" },
  { value: "daily", label: "Daily Struggles" },
  { value: "gratitude", label: "Gratitude" },
]

interface Post {
  id: string
  username: string
  title: string
  content: string
  category: string
  likes: number
  comments: number
  createdAt: Date
  isLiked: boolean
}

interface Comment {
  id: string
  postId: string
  username: string
  content: string
  createdAt: Date
}

const initialPosts: Post[] = [
  {
    id: "1",
    username: "HealingSoul_42",
    title: "First time sharing: My journey with anxiety",
    content: "I've been struggling with anxiety for years, but today I finally had the courage to share my story. It started in college when I had my first panic attack. For so long, I felt alone and misunderstood. But being here, reading all your stories, I realize I'm not alone. Thank you for creating this safe space.",
    category: "anxiety",
    likes: 47,
    comments: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isLiked: false,
  },
  {
    id: "2",
    username: "Warrior_77",
    title: "6 months clean - I never thought I'd make it",
    content: "Today marks 6 months since I started my recovery journey. There were days I wanted to give up, days when the darkness felt too heavy. But I kept going, one day at a time. If you're reading this and struggling, please know that recovery is possible. You are stronger than you think.",
    category: "recovery",
    likes: 124,
    comments: 31,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isLiked: true,
  },
  {
    id: "3",
    username: "QuietMind_19",
    title: "Grateful for small victories",
    content: "Today I got out of bed before noon. I know that might sound small to some, but for me, it's huge. Depression makes everything feel impossible. But today, I did it. I'm learning to celebrate these small wins.",
    category: "gratitude",
    likes: 89,
    comments: 18,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isLiked: false,
  },
  {
    id: "4",
    username: "StillStanding_33",
    title: "The weight of daily struggles",
    content: "Some days are just hard. Today was one of those days. But I'm here, I'm breathing, and I'm reaching out. That counts for something, right?",
    category: "daily",
    likes: 56,
    comments: 22,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isLiked: false,
  },
]

const initialComments: Comment[] = [
  {
    id: "c1",
    postId: "1",
    username: "GentleHeart_88",
    content: "Thank you for sharing. You're incredibly brave. Wishing you peace on your journey.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "c2",
    postId: "1",
    username: "HopeRises_22",
    content: "I relate to this so much. You're not alone. We're all in this together.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
]

export default function CommunityPage() {
  const [posts, setPosts] = React.useState<Post[]>(initialPosts)
  const [comments] = React.useState<Comment[]>(initialComments)
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null)
  const [showNewPostDialog, setShowNewPostDialog] = React.useState(false)
  const [newComment, setNewComment] = React.useState("")
  
  // New post form state
  const [newPostTitle, setNewPostTitle] = React.useState("")
  const [newPostContent, setNewPostContent] = React.useState("")
  const [newPostCategory, setNewPostCategory] = React.useState("")

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter((post) => post.category === selectedCategory)

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    )
  }

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) return

    const newPost: Post = {
      id: Date.now().toString(),
      username: "Anonymous_" + Math.floor(Math.random() * 100),
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      isLiked: false,
    }

    setPosts((prev) => [newPost, ...prev])
    setNewPostTitle("")
    setNewPostContent("")
    setNewPostCategory("")
    setShowNewPostDialog(false)
  }

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      depression: "bg-soft-blue/20 text-soft-blue dark:text-blue-300",
      anxiety: "bg-lavender/30 text-primary",
      recovery: "bg-sage/30 text-secondary-foreground",
      daily: "bg-muted text-muted-foreground",
      gratitude: "bg-gentle-rose/20 text-foreground",
    }
    return colors[category] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex min-h-screen flex-col cozy-texture relative overflow-hidden">
      {/* Cozy decorations */}
      <FairyLightsDecor className="absolute top-16 left-0 right-0 w-full h-8 opacity-40 hidden lg:block" />
      <PlantDecor className="absolute top-32 left-4 w-12 h-16 opacity-40 animate-sway hidden xl:block" />
      <PlantDecor className="absolute top-48 right-8 w-10 h-14 opacity-30 animate-sway hidden xl:block" style={{ animationDelay: "1s" }} />
      <CandleDecor className="absolute top-36 right-20 w-8 h-12 opacity-30 hidden xl:block" />
      <BlanketDecor className="absolute bottom-32 left-4 w-20 h-12 opacity-25 hidden xl:block" />
      
      {/* Wall quotes */}
      <div className="absolute top-28 left-1/4 hidden xl:block">
        <QuoteFrame quote="You are not alone" className="text-xs rotate-[-2deg]" />
      </div>
      
      <Navbar />

      <main className="container mx-auto flex-1 p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <StickerDecor text="community" variant="sage" />
            <StickerDecor text="safe space" variant="lavender" className="hidden sm:block" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Stories of Hope
          </h1>
          <p className="mt-2 text-muted-foreground">
            A safe space to share, connect, and heal together. You are not alone.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>

          <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Your Story</DialogTitle>
                <DialogDescription>
                  Your story matters. Share anonymously with our supportive community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your story a title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Your Story</Label>
                  <Textarea
                    id="content"
                    placeholder="Share what's on your heart..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[150px] rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory}
                  className="w-full rounded-full"
                >
                  Share Anonymously
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts Feed */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer border-border/40 transition-all hover:shadow-lg hover:border-primary/20"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {post.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-muted-foreground">
                      {post.username}
                    </span>
                  </div>
                  <Badge variant="secondary" className={cn("text-xs", getCategoryColor(post.category))}>
                    {categories.find((c) => c.value === post.category)?.label}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg leading-tight">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 leading-relaxed">
                  {post.content}
                </CardDescription>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(post.id)
                      }}
                      className={cn(
                        "flex items-center gap-1 transition-colors hover:text-primary",
                        post.isLiked && "text-primary"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                      {post.likes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Post Detail Dialog */}
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            {selectedPost && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedPost.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedPost.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(selectedPost.createdAt)}
                      </p>
                    </div>
                  </div>
                  <DialogTitle className="pt-2 text-xl">{selectedPost.title}</DialogTitle>
                  <Badge variant="secondary" className={cn("w-fit text-xs", getCategoryColor(selectedPost.category))}>
                    {categories.find((c) => c.value === selectedPost.category)?.label}
                  </Badge>
                </DialogHeader>

                <div className="py-4">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {selectedPost.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-y border-border/40 py-3">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={cn(
                      "flex items-center gap-1 transition-colors hover:text-primary",
                      selectedPost.isLiked && "text-primary"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", selectedPost.isLiked && "fill-current")} />
                    <span>{selectedPost.likes} likes</span>
                  </button>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-5 w-5" />
                    {selectedPost.comments} comments
                  </span>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Comments</h4>
                  {comments
                    .filter((c) => c.postId === selectedPost.id)
                    .map((comment) => (
                      <div key={comment.id} className="rounded-xl bg-muted p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {comment.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    ))}

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a supportive comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="rounded-xl"
                    />
                    <Button size="sm" className="rounded-xl">
                      Post
                    </Button>
                  </div>
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
