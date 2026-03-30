import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "chapter" | "rushee";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  activeView: AppRole | null;
  setActiveView: (view: AppRole) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isAdmin: false,
  activeView: null,
  setActiveView: () => {},
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoleAndAdmin = async (userId: string) => {
    // Fetch profile role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    const profileRole = (profile?.role as AppRole) ?? null;
    setRole(profileRole);

    // Check admin status
    const { data: adminRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    const admin = !!adminRow;
    setIsAdmin(admin);
    setActiveView(admin ? (profileRole ?? "chapter") : profileRole);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRoleAndAdmin(session.user.id), 0);
        } else {
          setRole(null);
          setIsAdmin(false);
          setActiveView(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoleAndAdmin(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setIsAdmin(false);
    setActiveView(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isAdmin, activeView, setActiveView, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
