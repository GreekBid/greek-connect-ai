import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Shirt, MessageSquare, HandHelping, HelpCircle, Loader2 } from "lucide-react";
import { streamChat, type Msg } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const tips = [
  { icon: Shirt, title: "What to Wear", prompts: ["What should I wear to a casual BBQ event?", "What's business casual for a rush dinner?"] },
  { icon: MessageSquare, title: "Conversation Starters", prompts: ["What are good questions to ask brothers/sisters?", "How do I start a conversation at a rush event?"] },
  { icon: HandHelping, title: "Interview Prep", prompts: ["What questions will they ask me in an interview?", "How do I talk about my interests without bragging?"] },
  { icon: HelpCircle, title: "Rush Process", prompts: ["How does the bid process work?", "What do chapters look for in rushees?"] },
];

export default function RusheeAICoach() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey! 👋 I'm your personal Rush Coach. I can help you prep for events, nail interviews, pick outfits, and understand the whole rush process. What can I help with?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length === newMessages.length + 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        context: "rushee",
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => toast.error(err),
      });
    } catch {
      toast.error("Failed to connect to AI coach");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" /> AI Rush Coach
        </h1>
        <p className="text-muted-foreground mt-1">Your personal guide through rush season</p>
      </div>

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
                      disabled={isLoading}
                      className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-left disabled:opacity-50"
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

      <Card className="bg-card shadow-warm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" /> Chat with your Rush Coach
          </h2>
        </div>
        <div ref={scrollRef} className="p-4 space-y-4 min-h-[280px] max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-accent text-accent-foreground rounded-bl-sm"
              }`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-accent text-accent-foreground p-3 rounded-xl rounded-bl-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex gap-2">
          <Input
            placeholder="Ask about outfits, interviews, the rush process…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
