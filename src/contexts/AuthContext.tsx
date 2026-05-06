import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "chapter" | "rushee";

interface SubscriptionDiscount {
  code: string | null;
  percent_off: number | null;
  name: string | null;
  duration: string;
  duration_in_months: number | null;
}

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
  // Subscription
  subscribed: boolean;
  subscriptionEnd: string | null;
  discount: SubscriptionDiscount | null;
  cancelAtPeriodEnd: boolean;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
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
  subscribed: false,
  subscriptionEnd: null,
  discount: null,
  cancelAtPeriodEnd: false,
  subscriptionLoading: false,
  refreshSubscription: async () => {},
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

  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [discount, setDiscount] = useState<SubscriptionDiscount | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const refreshSubscription = useCallback(async () => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscribed(!!data?.subscribed);
      setSubscriptionEnd(data?.subscription_end ?? null);
      setDiscount(data?.discount ?? null);
      setCancelAtPeriodEnd(!!data?.cancel_at_period_end);
    } catch (e) {
      console.error("[refreshSubscription]", e);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

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

    // Kick off subscription check for chapter users (skip admins/rushees)
    if (profileRole === "chapter" && !admin) {
      refreshSubscription();
    } else {
      setSubscribed(false);
      setDiscount(null);
      setSubscriptionEnd(null);
    }
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
          setSubscribed(false);
          setDiscount(null);
          setSubscriptionEnd(null);
          lastFetchedUserId.current = null;
          return;
        }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic re-check every 60s for chapter users (non-admin)
  useEffect(() => {
    if (!user || role !== "chapter" || isAdmin) return;
    const id = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(id);
  }, [user, role, isAdmin, refreshSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setGender(null);
    setIsAdmin(false);
    setActiveView(null);
    setSubscribed(false);
    setDiscount(null);
    setSubscriptionEnd(null);
    lastFetchedUserId.current = null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        gender,
        isAdmin,
        activeView,
        setActiveView,
        loading,
        signOut,
        subscribed,
        subscriptionEnd,
        discount,
        cancelAtPeriodEnd,
        subscriptionLoading,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
