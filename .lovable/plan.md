

# Make Logo Bigger and Remove White Background

## Problem
The uploaded logo PNG has a white rectangular background baked into the image file. This creates a visible white box around the logo, especially on non-white backgrounds (like the dark navy sidebar). The logo also appears small in several places.

## Solution

### 1. Remove the white background from the image
Use Python (Pillow) to process `public/logo.png` — convert the white background to transparent and save as a clean PNG with alpha channel. This eliminates the white outline everywhere the logo is used.

### 2. Increase logo sizes across the app
Update all `<img>` tags referencing the logo:

| Location | Current size | New size |
|---|---|---|
| Landing nav | `h-8` | `h-12` |
| Landing hero card | `h-16` | `h-20` |
| Login/Signup pages | `h-12` | `h-16` |
| Sidebar (Dashboard, Rushee, Admin) | `h-8` | `h-10` |
| Footer text | text only | no change |

### Files changed
- `public/logo.png` — reprocessed with transparent background
- `src/pages/Landing.tsx` — larger logo sizes
- `src/pages/LoginPage.tsx` — larger logo
- `src/pages/SignupPage.tsx` — larger logo
- `src/components/DashboardLayout.tsx` — larger sidebar logo
- `src/components/RusheeLayout.tsx` — larger sidebar logo
- `src/components/AdminLayout.tsx` — larger sidebar logo

