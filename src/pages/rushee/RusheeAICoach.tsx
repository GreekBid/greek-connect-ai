import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Shirt, MessageSquare, HandHelping, HelpCircle } from "lucide-react";

const tips = [
  { icon: Shirt, title: "What to Wear", prompts: ["What should I wear to a casual BBQ event?", "What's business casual for a rush dinner?"] },
  { icon: MessageSquare, title: "Conversation Starters", prompts: ["What are good questions to ask brothers/sisters?", "How do I start a conversation at a rush event?"] },
  { icon: HandHelping, title: "Interview Prep", prompts: ["What questions will they ask me in an interview?", "How do I talk about my interests without bragging?"] },
  { icon: HelpCircle, title: "Rush Process", prompts: ["How does the bid process work?", "What do chapters look for in rushees?"] },
];

type ChatMsg = { role: "user" | "assistant"; text: string };

const initialChat: ChatMsg[] = [
  { role: "assistant", text: "Hey! 👋 I'm your personal Rush Coach. I can help you prep for events, nail interviews, pick outfits, and understand the whole rush process. What can I help with?" },
];

export default function RusheeAICoach() {
  const [messages, setMessages] = useState<ChatMsg[]>(initialChat);
  const [input, setInput] = useState("");

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");

    setTimeout(() => {
      let response = "";
      const lower = msg.toLowerCase();
      if (lower.includes("wear") || lower.includes("outfit") || lower.includes("dress")) {
        response = "Great question! For a casual BBQ, go with clean shorts or jeans, a solid-color tee or polo, and clean sneakers. Avoid anything too flashy — you want to look approachable and put-together without trying too hard. For business casual events, think chinos + a button-down (no tie needed). The key: look like you care, but don't overdress the room.";
      } else if (lower.includes("question") || lower.includes("ask") || lower.includes("conversation")) {
        response = "Here are some solid questions to ask:\n\n1. \"What's your favorite memory from being in the chapter?\"\n2. \"How do you balance chapter commitments with academics?\"\n3. \"What made you choose this fraternity/sorority over others?\"\n4. \"What does a typical week look like for members?\"\n\nPro tip: Ask follow-up questions to what they say — it shows genuine interest and makes the conversation flow naturally.";
      } else if (lower.includes("interview") || lower.includes("prep")) {
        response = "Interviews are usually pretty conversational — not as formal as a job interview. They'll probably ask:\n\n• \"Tell us about yourself\" — keep it 60 seconds, hit your major, hometown, and 1-2 interests\n• \"Why this chapter?\" — mention specific events you attended or people you met\n• \"What do you bring to the table?\" — be honest about your strengths without overselling\n\nBiggest tip: Be authentic. They're looking for genuine people, not rehearsed answers.";
      } else if (lower.includes("bid") || lower.includes("process") || lower.includes("how")) {
        response = "Here's how rush typically works:\n\n1. **Open events** — casual events anyone can attend\n2. **Invite-only events** — chapters narrow the field and invite rushees they're interested in\n3. **Interviews** — one-on-one or small group conversations\n4. **Deliberation** — the chapter votes internally\n5. **Bid Day** — you receive a bid (invitation to join) from chapters that want you\n\nYou can receive bids from multiple chapters and choose the one that feels right. There's no obligation to accept!";
      } else {
        response = "That's a great question! During rush, the most important thing is to be yourself. Chapters can tell when someone is being genuine vs. putting on an act. Focus on building real connections — ask thoughtful questions, share your actual interests, and don't try to be someone you're not. Would you like me to help with something specific like outfit advice, interview prep, or understanding the process?";
      }
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" /> AI Rush Coach
        </h1>
        <p className="text-muted-foreground mt-1">Your personal guide through rush season</p>
      </div>

      {/* Quick topic cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {tips.map((t) => (
          <Card key={t.title} className="p-4 bg-card shadow-warm hover:shadow-warm-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <t.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-foreground text-sm">{t.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {t.prompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSend(p)}
                      className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chat */}
      <Card className="bg-card shadow-warm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" /> Chat with your Rush Coach
          </h2>
        </div>
        <div className="p-4 space-y-4 min-h-[280px] max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
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
            placeholder="Ask about outfits, interviews, the rush process…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} className="gap-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
