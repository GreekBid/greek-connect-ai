

The user reports that selected sidebar tabs are hard to see. Looking at `DashboardLayout.tsx` and `AdminLayout.tsx`, the active state uses `activeClassName="bg-sidebar-accent text-primary font-medium"`.

From `index.css`:
- `--sidebar-background: 215 45% 12%` (dark navy)
- `--sidebar-accent: 215 40% 18%` (slightly lighter navy — very low contrast against the background)
- `--primary: 215 55% 25%` (navy — used for `text-primary`, which on the dark navy `bg-sidebar-accent` is nearly invisible)

So the active tab has dark navy text on dark navy background. That's the contrast problem.

The sidebar already defines proper tokens for this exact purpose:
- `--sidebar-primary: 40 60% 55%` (gold)
- `--sidebar-primary-foreground: 215 50% 15%` (dark navy)
- `--sidebar-accent-foreground: 40 20% 90%` (cream)

## Fix

Change the active state in both layouts from `bg-sidebar-accent text-primary` to use the gold accent for high contrast against the dark navy sidebar.

**Recommended active style:** `bg-sidebar-primary text-sidebar-primary-foreground font-medium`
→ Gold pill with dark navy text. Highly visible, on-brand, matches the existing sidebar token system.

### Files to change

1. **`src/components/DashboardLayout.tsx`** — update `activeClassName` on the NavLink inside `renderNavItems` (line ~46).
2. **`src/components/AdminLayout.tsx`** — update `activeClassName` on the NavLink inside the admin nav loop (line ~32).
3. **`src/components/RusheeLayout.tsx`** — check and apply the same fix if it uses the same pattern (almost certainly does).

Also update the badge color logic so the count badge stays readable on the gold active background — change the badge from `bg-primary text-primary-foreground` to `bg-sidebar-primary-foreground text-sidebar-primary` only when active, OR simpler: keep the badge as-is but the active background change alone will resolve the user's complaint.

### Preview

```text
Before: [dark navy bg] [dark navy text "Dashboard"]   ← unreadable
After:  [gold bg]      [dark navy text "Dashboard"]   ← high contrast
```

No new tokens needed, no CSS changes — just swap two utility classes in 2-3 layout files.

