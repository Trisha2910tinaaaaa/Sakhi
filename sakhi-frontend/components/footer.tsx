import Link from "next/link"
import { Heart, Phone, Leaf } from "lucide-react"
import { PlantDecor, CandleDecor } from "@/components/cozy-aesthetics"

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-card/50 overflow-hidden">
      {/* Decorative elements */}
      <PlantDecor className="absolute bottom-0 left-4 w-10 h-14 opacity-20 hidden lg:block" />
      <CandleDecor className="absolute bottom-2 right-8 w-6 h-10 opacity-20 hidden lg:block" />
      
      {/* Crisis Banner */}
      <div className="bg-gentle-rose/15 dark:bg-gentle-rose/10 py-3 border-b border-gentle-rose/20">
        <div className="container mx-auto flex items-center justify-center gap-2 px-4 text-center text-sm">
          <Phone className="h-4 w-4 text-destructive" />
          <span className="text-foreground/80">
            <strong>In crisis?</strong> Call <a href="tel:988" className="font-semibold text-primary underline underline-offset-2">988</a> (Suicide & Crisis Lifeline) or <a href="tel:911" className="font-semibold text-primary underline underline-offset-2">911</a>
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Heart className="h-4 w-4 text-primary" />
                <Leaf className="absolute -top-1 -right-1 h-3 w-3 text-sage rotate-45" />
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">Sakhi</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Your cozy corner for healing. Anonymously. Compassionately. Always.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70 italic">
              {`"In my healing era"`}
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/therapist" className="hover:text-primary transition-colors">AI Therapist</Link></li>
              <li><Link href="/community" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="/journal" className="hover:text-primary transition-colors">Journal</Link></li>
              <li><Link href="/affirmations" className="hover:text-primary transition-colors">Affirmations</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get Help</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/directory" className="hover:text-primary transition-colors">Find a Therapist</Link></li>
              <li><a href="tel:988" className="hover:text-primary transition-colors">988 Lifeline</a></li>
              <li><span>Text HOME to 741741</span></li>
              <li><a href="tel:911" className="hover:text-primary transition-colors">Emergency: 911</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sakhi. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Sakhi is not a crisis service or replacement for professional therapy. 
              If you&apos;re in immediate danger, please call 988 or 911.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
