"use client"

import { cn } from "@/lib/utils"

// Minimalist Plant/Leaf decoration
export function PlantDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 60 80" className="w-full h-full" fill="none">
        {/* Pot */}
        <path d="M18 65 L42 65 L40 78 L20 78 Z" className="fill-terracotta/60" />
        <ellipse cx="30" cy="65" rx="12" ry="3" className="fill-terracotta/80" />
        {/* Soil */}
        <ellipse cx="30" cy="63" rx="10" ry="2" className="fill-cozy-tan" />
        {/* Stems and leaves */}
        <path d="M30 62 Q28 50 24 42" className="stroke-moss" strokeWidth="2" fill="none" />
        <path d="M30 62 Q32 48 38 38" className="stroke-moss" strokeWidth="2" fill="none" />
        <path d="M30 62 Q30 45 30 32" className="stroke-moss" strokeWidth="2" fill="none" />
        {/* Leaves */}
        <ellipse cx="22" cy="40" rx="6" ry="10" className="fill-sage/70" transform="rotate(-20 22 40)" />
        <ellipse cx="40" cy="36" rx="6" ry="10" className="fill-primary/60" transform="rotate(25 40 36)" />
        <ellipse cx="30" cy="28" rx="5" ry="12" className="fill-sage/80" />
        <ellipse cx="26" cy="52" rx="4" ry="7" className="fill-primary/50" transform="rotate(-10 26 52)" />
        <ellipse cx="35" cy="50" rx="4" ry="7" className="fill-sage/60" transform="rotate(15 35 50)" />
      </svg>
    </div>
  )
}

// Candle/Scent decoration
export function CandleDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 40 70" className="w-full h-full" fill="none">
        {/* Candle holder */}
        <ellipse cx="20" cy="65" rx="15" ry="4" className="fill-cozy-tan/80" />
        <rect x="8" y="60" width="24" height="5" rx="2" className="fill-cozy-tan/60" />
        {/* Candle body */}
        <rect x="12" y="25" width="16" height="36" rx="2" className="fill-warm-cream" />
        <rect x="12" y="25" width="16" height="36" rx="2" className="fill-lavender/20" />
        {/* Wick */}
        <rect x="19" y="18" width="2" height="8" className="fill-foreground/40" />
        {/* Flame */}
        <ellipse cx="20" cy="14" rx="4" ry="8" className="fill-amber-200/80 animate-twinkle" />
        <ellipse cx="20" cy="12" rx="2" ry="5" className="fill-amber-100/90" />
        {/* Glow */}
        <circle cx="20" cy="14" r="12" className="fill-amber-100/10 animate-glow" />
      </svg>
    </div>
  )
}

// Analog Clock decoration
export function ClockDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
        {/* Clock face */}
        <circle cx="30" cy="30" r="26" className="fill-card stroke-border" strokeWidth="2" />
        <circle cx="30" cy="30" r="23" className="fill-warm-cream/50" />
        {/* Hour markers */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <line
            key={i}
            x1="30"
            y1="10"
            x2="30"
            y2={i % 3 === 0 ? "13" : "11"}
            className="stroke-foreground/40"
            strokeWidth={i % 3 === 0 ? "2" : "1"}
            transform={`rotate(${angle} 30 30)`}
          />
        ))}
        {/* Hour hand */}
        <line x1="30" y1="30" x2="30" y2="18" className="stroke-foreground/70" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-30 30 30)" />
        {/* Minute hand */}
        <line x1="30" y1="30" x2="30" y2="12" className="stroke-foreground/50" strokeWidth="1.5" strokeLinecap="round" transform="rotate(60 30 30)" />
        {/* Center dot */}
        <circle cx="30" cy="30" r="2" className="fill-primary" />
      </svg>
    </div>
  )
}

// Wall Quote Frame
export function QuoteFrame({ quote, className }: { quote: string; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border-2 border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm",
      "font-serif text-sm italic text-foreground/80",
      className
    )}>
      <span className="text-primary/60">{`"`}</span>
      {quote}
      <span className="text-primary/60">{`"`}</span>
    </div>
  )
}

// Sand Timer decoration
export function SandTimerDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 40 70" className="w-full h-full" fill="none">
        {/* Top frame */}
        <rect x="8" y="5" width="24" height="4" rx="1" className="fill-cozy-tan" />
        {/* Bottom frame */}
        <rect x="8" y="61" width="24" height="4" rx="1" className="fill-cozy-tan" />
        {/* Glass outline */}
        <path d="M12 9 L12 28 Q20 35 20 35 Q20 35 28 28 L28 9" className="stroke-border" strokeWidth="1.5" fill="none" />
        <path d="M12 61 L12 42 Q20 35 20 35 Q20 35 28 42 L28 61" className="stroke-border" strokeWidth="1.5" fill="none" />
        {/* Top sand */}
        <path d="M14 10 L14 24 Q20 30 20 30 Q20 30 26 24 L26 10 Z" className="fill-cozy-tan/50" />
        {/* Bottom sand */}
        <path d="M14 60 L14 48 Q20 42 20 42 Q20 42 26 48 L26 60 Z" className="fill-cozy-tan/70" />
        {/* Falling sand stream */}
        <line x1="20" y1="32" x2="20" y2="40" className="stroke-cozy-tan/60" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}

// Blanket/Throw decoration
export function BlanketDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 80 50" className="w-full h-full" fill="none">
        {/* Folded blanket layers */}
        <path d="M5 40 Q40 35 75 40 L70 48 Q40 45 10 48 Z" className="fill-lavender/40" />
        <path d="M8 32 Q40 27 72 32 L68 40 Q40 36 12 40 Z" className="fill-sage/30" />
        <path d="M10 25 Q40 20 70 25 L66 33 Q40 29 14 33 Z" className="fill-gentle-rose/30" />
        {/* Texture lines */}
        <path d="M20 28 Q30 26 40 28 Q50 30 60 28" className="stroke-foreground/10" strokeWidth="0.5" fill="none" />
        <path d="M22 35 Q32 33 42 35 Q52 37 62 35" className="stroke-foreground/10" strokeWidth="0.5" fill="none" />
        {/* Fringe */}
        {[15, 25, 35, 45, 55, 65].map((x) => (
          <line key={x} x1={x} y1="46" x2={x} y2="50" className="stroke-lavender/50" strokeWidth="1" />
        ))}
      </svg>
    </div>
  )
}

// Psycho-educational Sticker
export function StickerDecor({ text, variant = "sage", className }: { 
  text: string; 
  variant?: "sage" | "lavender" | "rose" | "cream";
  className?: string 
}) {
  const variants = {
    sage: "bg-sage/20 text-moss border-sage/30",
    lavender: "bg-lavender/20 text-accent-foreground border-lavender/30",
    rose: "bg-gentle-rose/20 text-destructive/70 border-gentle-rose/30",
    cream: "bg-warm-cream text-foreground/70 border-cozy-tan/50",
  }
  
  return (
    <div className={cn(
      "inline-block rounded-full border px-3 py-1.5 text-xs font-medium",
      "shadow-sm rotate-[-2deg] hover:rotate-0 transition-transform",
      variants[variant],
      className
    )}>
      {text}
    </div>
  )
}

// Fairy Lights / String Lights decoration
export function FairyLightsDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 200 30" className="w-full h-full" fill="none">
        {/* Wire */}
        <path 
          d="M0 5 Q25 15 50 8 Q75 2 100 12 Q125 22 150 10 Q175 0 200 8" 
          className="stroke-foreground/20" 
          strokeWidth="1" 
          fill="none"
        />
        {/* Bulbs */}
        {[
          { x: 25, y: 12, delay: 0 },
          { x: 50, y: 8, delay: 0.3 },
          { x: 75, y: 5, delay: 0.6 },
          { x: 100, y: 12, delay: 0.9 },
          { x: 125, y: 18, delay: 0.2 },
          { x: 150, y: 10, delay: 0.5 },
          { x: 175, y: 4, delay: 0.8 },
        ].map((bulb, i) => (
          <g key={i}>
            <circle 
              cx={bulb.x} 
              cy={bulb.y + 6} 
              r="4" 
              className="fill-amber-100/80 animate-twinkle"
              style={{ animationDelay: `${bulb.delay}s` }}
            />
            <circle 
              cx={bulb.x} 
              cy={bulb.y + 6} 
              r="6" 
              className="fill-amber-100/20"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

// Book Stack decoration
export function BookStackDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 50 60" className="w-full h-full" fill="none">
        {/* Bottom book */}
        <rect x="5" y="45" width="40" height="10" rx="1" className="fill-sage/40" />
        <rect x="5" y="45" width="3" height="10" className="fill-sage/60" />
        {/* Middle book */}
        <rect x="8" y="33" width="35" height="11" rx="1" className="fill-lavender/40" transform="rotate(-3 8 33)" />
        <rect x="8" y="33" width="2" height="11" className="fill-lavender/60" transform="rotate(-3 8 33)" />
        {/* Top book */}
        <rect x="10" y="22" width="32" height="10" rx="1" className="fill-gentle-rose/40" transform="rotate(2 10 22)" />
        <rect x="10" y="22" width="2" height="10" className="fill-gentle-rose/60" transform="rotate(2 10 22)" />
        {/* Reading glasses on top */}
        <ellipse cx="25" cy="18" rx="6" ry="4" className="stroke-foreground/30" strokeWidth="1" fill="none" />
        <ellipse cx="38" cy="18" rx="6" ry="4" className="stroke-foreground/30" strokeWidth="1" fill="none" />
        <line x1="31" y1="18" x2="32" y2="18" className="stroke-foreground/30" strokeWidth="1" />
      </svg>
    </div>
  )
}

// Essential Oil Diffuser
export function DiffuserDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 50 70" className="w-full h-full" fill="none">
        {/* Base */}
        <ellipse cx="25" cy="62" rx="18" ry="4" className="fill-cozy-tan/60" />
        {/* Body */}
        <path d="M12 60 Q10 45 15 30 Q20 20 25 18 Q30 20 35 30 Q40 45 38 60 Z" className="fill-warm-cream" />
        <path d="M12 60 Q10 45 15 30 Q20 20 25 18 Q30 20 35 30 Q40 45 38 60 Z" className="fill-sage/10" />
        {/* Opening */}
        <ellipse cx="25" cy="18" rx="8" ry="3" className="fill-foreground/10" />
        {/* Mist particles */}
        <circle cx="22" cy="8" r="2" className="fill-soft-blue/30 animate-drift" />
        <circle cx="25" cy="5" r="1.5" className="fill-soft-blue/25 animate-drift" style={{ animationDelay: "0.5s" }} />
        <circle cx="28" cy="10" r="1.5" className="fill-soft-blue/20 animate-drift" style={{ animationDelay: "1s" }} />
        <circle cx="20" cy="3" r="1" className="fill-soft-blue/15 animate-drift" style={{ animationDelay: "1.5s" }} />
      </svg>
    </div>
  )
}

// Decorative Rug/Mat
export function RugDecor({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <svg viewBox="0 0 120 40" className="w-full h-full" fill="none">
        {/* Rug base */}
        <rect x="5" y="5" width="110" height="30" rx="2" className="fill-cozy-tan/40" />
        {/* Pattern */}
        <rect x="15" y="10" width="90" height="20" rx="1" className="fill-sage/20" />
        <rect x="25" y="14" width="70" height="12" rx="1" className="fill-lavender/15" />
        {/* Center design */}
        <circle cx="60" cy="20" r="4" className="fill-gentle-rose/30" />
        <circle cx="60" cy="20" r="2" className="fill-warm-cream" />
        {/* Tassels */}
        {[10, 15, 20, 100, 105, 110].map((x) => (
          <line key={x} x1={x} y1="35" x2={x} y2="40" className="stroke-cozy-tan/60" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  )
}

// Cozy Room Corner Scene
export function CozyCorner({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <PlantDecor className="absolute bottom-0 left-0 w-12 h-16 animate-sway" />
      <CandleDecor className="absolute bottom-0 left-14 w-8 h-14" />
      <BookStackDecor className="absolute bottom-0 left-24 w-10 h-12" />
    </div>
  )
}
