import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, Users, HelpCircle, ClipboardCheck, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { streamChat, type Msg } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const aiTools = [
  { icon: HelpCircle, title: "Interview Prep", desc: "Get suggested questions for specific rushees based on their profile", prompt: "Suggest interview questions for a rushee who is a finance major interested in basketball and leadership" },
  { icon: Users, title: "Interview Matching", desc: "AI matches which brother/sister should interview each rushee", prompt: "How should we match brothers with rushees for interviews to get the best conversations?" },
  { icon: ClipboardCheck, title: "Interview Notes", desc: "AI helps organize notes and suggests ratings", prompt: "Help me organize my interview notes and suggest what to look for when rating rushees" },
  { icon: Sparkles, title: "Best Fit Analysis", desc: "See which rushees match best with your chapter's values", prompt: "What criteria should we use to evaluate cultural fit during rush?" },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey! I'm your RushFlow AI Coach. I can help with interview prep, scheduling, matching, and deciding who to choose. What would you like help with?" },
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
        context: "chapter",
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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" /> AI Coach
        </h1>
        <p className="text-muted-foreground mt-1">Your intelligent assistant for rush season</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {aiTools.map((t) => (
          <Card
            key={t.title}
            className="p-5 bg-card shadow-warm hover:shadow-warm-lg transition-shadow cursor-pointer"
            onClick={() => handleSend(t.prompt)}
          >
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

      <Card className="bg-card shadow-warm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Chat with AI Coach
          </h2>
        </div>
        <div ref={scrollRef} className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
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
            placeholder="Ask about interviews, scheduling, matching..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button variant="hero" size="default" onClick={() => handleSend()} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
