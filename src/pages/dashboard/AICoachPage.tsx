import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Users, HelpCircle, ClipboardCheck } from "lucide-react";
import { useState } from "react";

const aiTools = [
  { icon: HelpCircle, title: "Interview Prep", desc: "Get suggested questions for specific rushees based on their profile" },
  { icon: Users, title: "Interview Matching", desc: "AI matches which brother/sister should interview each rushee" },
  { icon: ClipboardCheck, title: "Interview Notes", desc: "AI listens, takes notes, and suggests ratings during interviews" },
  { icon: Sparkles, title: "Best Fit Analysis", desc: "See which rushees match best with your chapter's values and culture" },
];

const mockChat = [
  { role: "assistant" as const, text: "Hey! I'm your RushFlow AI Coach. I can help with interview prep, scheduling, matching, and deciding who to choose. What would you like help with?" },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState(mockChat);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user" as const, text: input }]);
    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "assistant" as const,
        text: "Great question! Based on Jake Martinez's profile — his interest in finance and basketball, combined with his leadership background — I'd suggest pairing him with a brother who shares similar interests. Try asking about his experience leading teams and how he handles conflict. Would you like me to generate a full interview guide?"
      }]);
    }, 800);
    setInput("");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" /> AI Coach
        </h1>
        <p className="text-muted-foreground mt-1">Your intelligent assistant for rush season</p>
      </div>

      {/* AI Tools */}
      <div className="grid sm:grid-cols-2 gap-4">
        {aiTools.map((t) => (
          <Card key={t.title} className="p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <t.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chat */}
      <Card className="bg-card shadow-warm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Chat with AI Coach
          </h2>
        </div>
        <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-accent text-accent-foreground rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            placeholder="Ask about interviews, scheduling, matching..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button variant="hero" size="default" onClick={handleSend} className="gap-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
