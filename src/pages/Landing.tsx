import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, Star, BarChart3, MessageSquare, Brain, Shield, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Users, title: "Rushee Profiles", desc: "Complete profiles with major, hometown, socials, interests & notes" },
  { icon: Calendar, title: "Event Hub", desc: "RSVP, headcount, attendance tracking — all in one place" },
  { icon: Star, title: "Private Rankings", desc: "Star & rank applicants privately — only your chapter sees them" },
  { icon: BarChart3, title: "Analytics", desc: "Track applicants, bids, and event attendance at a glance" },
  { icon: Brain, title: "AI Coach", desc: "Interview prep, scheduling help, and applicant matching" },
  { icon: Shield, title: "Bid Management", desc: "Track every rushee through review → bid → accepted pipeline" },
];

const howItWorks = [
  { step: "1", title: "Sign Up", desc: "Create an account as a chapter or a rushee — it takes 30 seconds." },
  { step: "2", title: "Set Up", desc: "Chapters create events and invite rushees. Rushees build their profiles." },
  { step: "3", title: "Connect", desc: "RSVP to events, take notes, rank candidates, and send broadcasts." },
  { step: "4", title: "Decide", desc: "Use analytics, AI insights, and rankings to make confident bid decisions." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="GreekBid" className="h-10 w-auto" />
          <span className="font-display font-bold text-xl text-foreground hidden sm:inline">GreekBid</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-hero-gradient py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
          <div className="space-y-6 animate-fade-in lg:col-span-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-primary text-xs font-medium">
              <Star className="w-3 h-3 fill-current" /> Built for Greek life, by Greek life
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Rush season,{" "}
              <span className="text-gradient">simplified.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg font-body">
              The all-in-one platform for fraternities and sororities to manage recruitment — from first interest form to final bid.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/signup?role=chapter">
                <Button variant="hero" size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup?role=rushee" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                I'm a rushee <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Free to start</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /> No credit card</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Setup in minutes</div>
            </div>
          </div>

          {/* Product preview mockup */}
          <div className="animate-fade-in lg:col-span-2" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/40 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-card rounded-2xl shadow-warm-lg border border-border overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-background">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-[10px] text-muted-foreground font-mono">greekbid.com/dashboard</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This week</p>
                      <p className="font-display font-bold text-foreground text-lg">Rush Pipeline</p>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-accent text-primary text-[10px] font-semibold">Live</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { n: "47", l: "Rushees", c: "bg-primary/10 text-primary" },
                      { n: "12", l: "Bids out", c: "bg-accent text-primary" },
                      { n: "8", l: "Accepted", c: "bg-green-500/10 text-green-700" },
                    ].map((s) => (
                      <div key={s.l} className={`rounded-lg p-3 ${s.c}`}>
                        <p className="text-xl font-display font-bold">{s.n}</p>
                        <p className="text-[10px] opacity-80">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { n: "Alex M.", t: "Bid sent", s: "bg-primary" },
                      { n: "Jordan T.", t: "Reviewing", s: "bg-yellow-400" },
                      { n: "Sam R.", t: "Accepted ✓", s: "bg-green-500" },
                    ].map((r) => (
                      <div key={r.n} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors">
                        <div className={`w-8 h-8 rounded-full ${r.s} text-white flex items-center justify-center text-xs font-bold`}>
                          {r.n.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{r.n}</p>
                          <p className="text-[10px] text-muted-foreground">{r.t}</p>
                        </div>
                        <Star className="w-3.5 h-3.5 text-primary fill-current" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Everything you need for rush</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From organizing events to AI-powered applicant matching — GreekBid handles it all so you can focus on finding the right fit.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="bg-card rounded-xl p-6 shadow-warm hover:shadow-warm-lg transition-shadow animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground">Get started in minutes — no training required.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* For Chapters vs For Rushees */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="rounded-xl bg-background p-8 shadow-warm">
            <h3 className="text-2xl font-display font-bold text-foreground mb-4">For Chapters</h3>
            <ul className="space-y-3">
              {["Create & manage rush events", "Browse & star rushee profiles", "Private voting & rankings", "Bid pipeline management", "Broadcast messages to all rushees", "AI-powered interview coaching", "Real-time analytics dashboard"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup?role=chapter" className="mt-6 inline-block">
              <Button variant="hero" className="gap-2">Get Started as Chapter <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="rounded-xl bg-background p-8 shadow-warm">
            <h3 className="text-2xl font-display font-bold text-foreground mb-4">For Rushees</h3>
            <ul className="space-y-3">
              {["Build your profile with socials & interests", "Browse & RSVP to rush events", "Get reminders & chapter broadcasts", "Take private notes on chapters", "AI Coach for interview prep & outfit tips", "Track your rush schedule in one place"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup?role=rushee" className="mt-6 inline-block">
              <Button variant="hero-outline" className="gap-2">Get Started as Rushee <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-warm-gradient py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Ready to streamline your rush?</h2>
          <p className="text-muted-foreground">Join chapters across the country already using GreekBid.</p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="lg">Start Free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">GreekBid</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <a href="mailto:admin@greekbid.com" className="hover:text-foreground">Support</a>
          </div>
          <span>© 2026 GreekBid. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
