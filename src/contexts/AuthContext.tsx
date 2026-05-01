import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "chapter" | "rushee";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  gender: string | null;
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
  gender: null,
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
  const [gender, setGender] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const lastFetchedUserId = useRef<string | null>(null);

  const fetchRoleAndAdmin = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, gender")
      .eq("user_id", userId)
      .single();

    const profileRole = (profile?.role as AppRole) ?? null;
    setRole(profileRole);
    setGender((profile as any)?.gender ?? null);

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
    lastFetchedUserId.current = userId;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setRole(null);
          setGender(null);
          setIsAdmin(false);
          setActiveView(null);
          setLoading(false);
          lastFetchedUserId.current = null;
          return;
        }

        // Skip re-fetch on TOKEN_REFRESHED — it fires every hour and role doesn't change
        const isNewUser = lastFetchedUserId.current !== session.user.id;
        const shouldFetch =
          isNewUser ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION";

        if (shouldFetch) {
          setTimeout(() => fetchRoleAndAdmin(session.user.id), 0);
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
    setGender(null);
    setIsAdmin(false);
    setActiveView(null);
    lastFetchedUserId.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, session, role, gender, isAdmin, activeView, setActiveView, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
