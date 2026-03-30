import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminViewSwitcher() {
  const { isAdmin, activeView, setActiveView } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) return null;

  const switchTo = (view: "chapter" | "rushee") => {
    setActiveView(view);
    navigate(view === "chapter" ? "/dashboard" : "/rushee");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-warm-lg p-2 flex items-center gap-2">
      <span className="text-xs text-muted-foreground px-2 font-medium">Admin</span>
      <button
        onClick={() => switchTo("chapter")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          activeView === "chapter"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent"
        }`}
      >
        Chapter View
      </button>
      <button
        onClick={() => switchTo("rushee")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          activeView === "rushee"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent"
        }`}
      >
        Rushee View
      </button>
    </div>
  );
}
