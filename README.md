# FlowPilot — Next.js app

FlowPilot ke teeno design deliverables (design system, landing page, auth + onboarding)
ab ek proper **Next.js 14 (App Router) + TypeScript** project me hain.
Tailwind ki zaroorat nahi — design tokens CSS variables me hain (`app/globals.css`),
wahi single source of truth hai.

## Run karne ke liye

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Routes

| Route              | Kya hai                                             |
| ------------------ | --------------------------------------------------- |
| `/`                | Landing page                                        |
| `/design-system`   | Design Foundation v1.0 (living style guide)         |
| `/welcome`         | Auth — welcome screen                               |
| `/signup` `/login` | Auth forms (validation, strength meter, states)     |
| `/forgot-password` | Reset flow + success state                          |
| `/verify`          | Email verified (animated check)                     |
| `/account-created` | Post-signup welcome                                 |
| `/onboarding`      | 8-step guided setup (state carries to summary)      |
| `/dashboard`       | Skeleton → empty states                             |

## Structure

```
app/
  globals.css      <- DESIGN TOKENS (colors, type, spacing, radius, shadows, motion)
  ds.css           <- design-system page styles (scoped: .pg-ds)
  landing.css      <- landing styles (scoped: .pg-landing)
  flow.css         <- auth/onboarding styles (scoped: .pg-flow)
  layout.tsx       <- fonts, icon sprite, global css
  page.jsx         <- landing
  design-system/   <- style guide route
  welcome/ signup/ login/ ... dashboard/   <- thin wrappers over FlowApp
components/
  IconSprite.tsx   <- saare icons (Lucide-style, 1.5px stroke)
  FlowApp.jsx      <- 16-screen auth+onboarding prototype (initial screen per route)
  ui/              <- Button / Field / Badge — component extraction ka starting point
```

## Demo hooks (prototype)

- Workspace name `acme`, `test`, `flowpilot` → "already taken" error
- Login email `offline@demo.com` → network error alert
- Login password < 8 chars → auth error
- Bottom-right **Screens** button → kisi bhi screen par jump

## Next steps (kal ke liye)

1. `FlowApp.jsx` ko screen-wise components me todo (`components/flow/SignupForm.tsx` etc.)
   aur DOM-effect logic ko React state (`useState`) me convert karo.
2. In-flow transitions ko `next/navigation` router pe le jao (abhi SPA-style hain).
3. `components/ui/` kit ko badhao — Button/Field/Badge ready hain, unhe pages me use karo.
4. Real auth ke liye NextAuth ya apna API route jodo.
5. Sab theek lagne par `next.config.mjs` me `reactStrictMode: true` kar do.
