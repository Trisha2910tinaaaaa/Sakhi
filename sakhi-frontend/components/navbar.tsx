"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Heart, Moon, Sun, Leaf } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "AI Therapist", href: "/therapist" },
  { name: "Community", href: "/community" },
  { name: "Journal", href: "/journal" },
  { name: "Affirmations", href: "/affirmations" },
  { name: "Find a Therapist", href: "/directory" },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Heart className="h-4 w-4 text-primary" />
            <Leaf className="absolute -top-1 -right-1 h-3 w-3 text-sage rotate-45" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Sakhi</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-muted/50"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-600" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/signin" className="hidden md:block">
            <Button variant="default" className="rounded-full px-5 shadow-sm shadow-primary/20">
              Sign In
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-lg">
              <div className="flex flex-col gap-4 pt-8">
                <div className="mb-4 px-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Navigation</p>
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href="/signin" onClick={() => setOpen(false)}>
                  <Button variant="default" className="mt-4 w-full rounded-full shadow-sm shadow-primary/20">
                    Sign In
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
