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
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GreekBid" className="h-16 w-auto" />
        </div>
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
      <section className="bg-hero-gradient py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Rush season,{" "}
              <span className="text-gradient">simplified.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg font-body">
              The all-in-one platform for fraternities and sororities to manage recruitment — from first interest form to final bid.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup?role=chapter">
                <Button variant="hero" size="lg" className="gap-2">
                  I'm a Chapter <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup?role=rushee">
                <Button variant="hero-outline" size="lg" className="gap-2">
                  I'm Rushing <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="animate-fade-in lg:flex lg:items-center lg:justify-center" style={{ animationDelay: "0.2s" }}>
            <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-warm-lg p-8 text-center space-y-4">
              <img src="/logo.png" alt="GreekBid" className="h-24 w-auto mx-auto" />
              <h2 className="text-2xl font-display font-bold text-foreground">Join GreekBid</h2>
              <p className="text-muted-foreground text-sm">Start managing your rush in minutes.</p>
              <Link to="/signup">
                <Button variant="hero" size="lg" className="w-full gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Button>
              </Link>
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
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">GreekBid</span>
          <span>© 2026 GreekBid. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
