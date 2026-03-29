# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Architecture

Single-page React app with no backend — all state persists to `localStorage`.

**Key files:**
- `src/App.jsx` — The entire application (~11k lines). One large `BudgetDashboard` component with all subcomponents, state, and logic defined inline.
- `src/main.jsx` — React entry point, mounts `<App />`.
- `index.html` — Root HTML with global dark-theme CSS.

**State & storage:**
- Two primary state objects: `accounts` and `budget` (array of pay periods).
- Persisted under localStorage keys: `budget_accounts`, `budget_data`, `budget_networth`.
- `useMemo`/`useCallback` are used extensively for derived totals and chart data.

**Tabs:** Overview · Budget · Balances · Net Worth — each rendered conditionally based on `activeTab` state.

**Charting:** Recharts (AreaChart, PieChart, BarChart, LineChart) with a shared `ChartTooltip` component.

**Styling:** Inline styles throughout, dark theme only (`#0a1628` background, `#3b82f6` accent). No CSS files or CSS-in-JS library.

**Data:** All account balances, budget periods (bi-weekly, 2026), and net worth items are initialized as hardcoded defaults and then overridden by localStorage on load.
