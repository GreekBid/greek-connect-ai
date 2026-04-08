import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminViewSwitcher() {
  const { isAdmin, activeView, setActiveView } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  const views = [
    { key: "admin" as const, label: "Admin", path: "/admin" },
    { key: "chapter" as const, label: "Chapter View", path: "/dashboard" },
    { key: "rushee" as const, label: "Rushee View", path: "/rushee" },
  ];

  const switchTo = (view: "admin" | "chapter" | "rushee") => {
    if (view === "admin") {
      setActiveView("chapter"); // keep activeView valid for context
      navigate("/admin");
    } else {
      setActiveView(view);
      navigate(view === "chapter" ? "/dashboard" : "/rushee");
    }
  };

  const currentPath = window.location.pathname;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-warm-lg p-2 flex items-center gap-2">
      <span className="text-xs text-muted-foreground px-2 font-medium">Admin</span>
      {views.map((v) => {
        const isActive = currentPath.startsWith(v.path);
        return (
          <button
            key={v.key}
            onClick={() => switchTo(v.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
