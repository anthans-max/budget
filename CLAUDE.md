# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
```bash
npm run dev      # Start dev server (Vite, localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Architecture

Single-page React app (React + Vite) deployed on Vercel at https://budget-aaao.vercel.app/

**Key files:**
- `src/App.jsx` — Main application component. Handles all UI, tab rendering, and derived calculations. Does NOT own data state directly.
- `src/useBudgetData.js` — Custom hook that owns all 6 data state variables. Single source of truth for data loading and persistence. Always modify data logic here, not in App.jsx.
- `src/supabaseClient.js` — Supabase client initialization. Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from env vars. Returns null if env vars are missing (app falls back to localStorage).
- `src/main.jsx` — React entry point.

## Data Layer

**Primary store:** Supabase (lotus-ops project)
**Fallback:** localStorage (writes always happen, reads only if Supabase unavailable)

**Supabase tables and stable row UUIDs:**
| Table                | Row ID                                |
|----------------------|---------------------------------------|
| budget_accounts      | a1000000-0000-0000-0000-000000000001  |
| budget_monthly       | a1000000-0000-0000-0000-000000000002  |
| budget_categories    | a1000000-0000-0000-0000-000000000003  |
| business_budget      | a1000000-0000-0000-0000-000000000004  |
| business_categories  | a1000000-0000-0000-0000-000000000005  |
| business_monthly     | a1000000-0000-0000-0000-000000000006  |

Each table stores a single row with a `data` jsonb column containing the full state object.

**Race condition prevention:** All state initializes as null in useBudgetData.js. Persist effects only fire after isReadyRef.current = true (set after Supabase load completes). Never initialize state with hardcoded defaults in useState — defaults are fallbacks of last resort in the load effect only.

## Tabs
Overview · Budget · Business · Balances · Net Worth

## Design System
Lotus AI design system — Cormorant Garamond/DM Mono fonts, cream/forest green/copper palette. Design tokens live in the `T` object at the top of `src/App.jsx`. See lotus_ai_design_spec_v2.html for reference.

## Styling
Inline styles throughout. No CSS files or CSS-in-JS library.

## Charting
Recharts (AreaChart, PieChart, BarChart, LineChart) with a shared ChartTooltip component.