import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, Star, BarChart3, MessageSquare, Brain, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const features = [
  { icon: Users, title: "Rushee Profiles", desc: "Complete profiles with major, hometown, socials, interests & notes" },
  { icon: Calendar, title: "Event Hub", desc: "RSVP, headcount, attendance tracking — all in one place" },
  { icon: Star, title: "Private Rankings", desc: "Star & rank applicants privately — only your chapter sees them" },
  { icon: BarChart3, title: "Analytics", desc: "Track applicants, bids, and event attendance at a glance" },
  { icon: Brain, title: "AI Coach", desc: "Interview prep, scheduling help, and applicant matching" },
  { icon: Shield, title: "Verified Accounts", desc: "Ensure every applicant is legit with account verification" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">R</span>
          </div>
          <span className="text-xl font-display font-bold text-foreground">RushFlow</span>
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
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <img src={heroImage} alt="Students connecting during rush" className="rounded-2xl shadow-warm-lg w-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Everything you need for rush</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From organizing events to AI-powered applicant matching — RushFlow handles it all so you can focus on finding the right fit.</p>
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

      {/* CTA */}
      <section className="bg-warm-gradient py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Ready to streamline your rush?</h2>
          <p className="text-muted-foreground">Join chapters across the country already using RushFlow.</p>
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
          <span className="font-display font-semibold text-foreground">RushFlow</span>
          <span>© 2026 RushFlow. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
