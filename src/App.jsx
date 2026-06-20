import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { useBudgetData, monthNames } from "./useBudgetData";

// Balances tab — account groupings, in display order. Subtotals use T.red for debt.
const BALANCE_GROUPS = [
  { label: "Checking", types: ["Checking"] },
  { label: "Credit Cards", types: ["Credit Card"], debt: true },
  { label: "Investments & Retirement", types: ["Investment", "Retirement"] },
  { label: "Assets", types: ["Asset"] },
];

const netWorthItems = [
  { name: "Savings", value: 240000 },
  { name: "Robinhood", value: 0 },
  { name: "Aaranya Fund", value: 110000 },
  { name: "Saanvi Fund", value: 100000 },
  { name: "Home", value: 2000000 },
  { name: "Retirement", value: 240000 },
  { name: "Saiyini Retirement", value: 150000 },
];

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) => {
  if (n === undefined || n === null) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n < 0 ? "-" : "") + "$" + (abs / 1000000).toFixed(1) + "M";
  if (abs >= 1000) return (n < 0 ? "-" : "") + "$" + (abs / 1000).toFixed(0) + "k";
  return "$" + n.toFixed(0);
};
const fmtFull = (n) => {
  if (n === undefined || n === null) return "$0";
  const neg = n < 0;
  return (neg ? "-" : "") + "$" + Math.round(Math.abs(n)).toLocaleString("en-US");
};
// Format a raw numeric string with thousands separators, preserving an
// in-progress trailing decimal (e.g. "1000." → "1,000.", "1000.5" → "1,000.5").
const formatComma = (raw) => {
  if (raw === "" || raw === "-") return raw;
  const neg = raw.startsWith("-");
  const [intPart, decPart] = raw.replace("-", "").split(".");
  const intFmt = intPart === "" ? "" : Number(intPart).toLocaleString("en-US");
  let out = (neg ? "-" : "") + intFmt;
  if (raw.includes(".")) out += "." + (decPart ?? "");
  return out;
};

// ── Design Tokens ────────────────────────────────────────────
const T = {
  bg:       '#f4f1ea',
  surface:  '#fbf9f3',
  dark:     '#1d1f17',
  muted:    '#3d3a30',
  faint:    '#5a5650',
  green:    '#2d5a38',
  copper:   '#a87412',
  red:      '#a5432b',
  border:   'rgba(20,22,15,0.10)',
  border2:  'rgba(20,22,15,0.16)',
  fontSans: "'Inter', sans-serif",
  fontSerif:"'Cormorant Garamond', serif",
};
const HEADER_BG = "#f0ece3";
const CHIP_BG = "#ece7db";
const PIE_COLORS = ["#2d5a38", "#a87412", "#6f6a5c", "#a5432b", "#8a8475", "#3d6348", "#c08a3a"];

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    padding: "22px 24px",
    marginBottom: 20,
    ...style
  }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 style={{
    margin: "0 0 18px",
    fontSize: 10,
    color: T.muted,
    fontWeight: 500,
    fontFamily: T.fontSans,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  }}>{children}</h3>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border2}`,
      padding: "10px 14px", fontSize: 11, color: T.dark,
      fontFamily: T.fontSans,
    }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: T.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tab Button ───────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    background: active ? "#1d1f17" : "transparent",
    border: active ? "1px solid #1d1f17" : `1px solid ${T.border2}`,
    color: active ? "#f4f1ea" : T.muted,
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: T.fontSans,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s",
  }}>{children}</button>
);

// ── KPI Card ─────────────────────────────────────────────────
const KPI = ({ title, value, subtitle, color, accent, negative = false }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderLeft: `4px solid ${accent || T.copper}`,
    padding: "22px 24px",
    flex: 1,
    minWidth: 160,
  }}>
    <div style={{
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: T.muted,
      marginBottom: 10,
      fontFamily: T.fontSans,
    }}>{title}</div>
    <div style={{
      fontFamily: T.fontSerif,
      fontWeight: 600,
      fontSize: "2.2rem",
      color: color || (negative ? T.red : T.dark),
      lineHeight: 1,
      marginBottom: 5,
    }}>{value}</div>
    {subtitle && (
      <div style={{
        fontSize: 13,
        fontWeight: 400,
        color: T.faint,
        fontFamily: T.fontSans,
      }}>{subtitle}</div>
    )}
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(20,22,15,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "lotusFade 0.2s ease"
  }} onClick={onClose}>
    <div style={{
      background: T.surface, border: `1px solid ${T.border2}`,
      padding: 28, minWidth: 380, maxWidth: 520, width: "90%", maxHeight: "80vh", overflowY: "auto"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: T.fontSerif, fontWeight: 600, fontSize: "1.5rem", color: T.dark }}>{title}</h2>
        <button onClick={onClose} style={{
          background: "none", border: "none", fontSize: 18, color: T.muted, cursor: "pointer"
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const labelStyle = { display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 5, fontFamily: T.fontSans };
const fieldStyle = { width: "100%", padding: "10px 12px", background: T.bg, border: `1px solid ${T.border2}`, fontSize: 15, color: T.dark, fontFamily: T.fontSans, outline: "none", boxSizing: "border-box" };

const Input = ({ label, value, onChange, type = "number", comma = false }) => {
  const numDisplay = (v) => comma ? Number(v ?? 0).toLocaleString("en-US") : String(v ?? 0);
  const [display, setDisplay] = useState(() => type === "number" ? numDisplay(value) : value);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDisplay(type === "number" ? numDisplay(value) : value);
  }, [value, type]);
  if (type !== "number") {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={fieldStyle} />
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onFocus={() => { focused.current = true; }}
        onPaste={e => {
          e.preventDefault();
          const pasted = e.clipboardData.getData("text").replace(/[$,\s]/g, "");
          if (pasted === "" || /^-?\d*\.?\d*$/.test(pasted)) {
            setDisplay(comma ? formatComma(pasted) : pasted);
            const num = parseFloat(pasted);
            if (!isNaN(num)) onChange(num);
          }
        }}
        onChange={e => {
          const raw = e.target.value.replace(/,/g, "");
          if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
            setDisplay(comma ? formatComma(raw) : raw);
            const num = parseFloat(raw);
            if (!isNaN(num)) onChange(num);
          }
        }}
        onBlur={() => {
          focused.current = false;
          const num = parseFloat(display.replace(/,/g, ""));
          const final = isNaN(num) ? 0 : num;
          setDisplay(numDisplay(final));
          onChange(final);
        }}
        style={fieldStyle}
      />
    </div>
  );
};

const Btn = ({ onClick, children, variant = "primary", style = {} }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: variant === "primary" ? T.green : "transparent",
    color: variant === "primary" ? T.bg : T.muted,
    border: variant === "primary" ? `1px solid ${T.green}` : `1px solid ${T.border2}`,
    padding: variant === "primary" ? "9px 20px" : "8px 18px",
    fontSize: 11,
    fontFamily: T.fontSans,
    fontWeight: 400,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.2s",
    ...style,
  }}>{children}</button>
);

// Shared row-action button styles
const editBtnStyle = { border: `1px solid ${T.border2}`, background: "transparent", color: T.muted, fontFamily: T.fontSans, fontSize: 13, padding: "7px 16px", cursor: "pointer", letterSpacing: "0.04em" };
const removeBtnStyle = { ...editBtnStyle, color: T.red, borderColor: "rgba(165,67,43,0.32)" };

// ── Inline table editing ─────────────────────────────────────
const cellInputStyle = { background: "#fff", border: `1px solid ${T.green}`, padding: "4px 8px", width: "100%", fontFamily: T.fontSans, fontSize: 15, textAlign: "right", boxSizing: "border-box", outline: "none" };

// Numeric input for an inline table cell. Reports a Number via onChange;
// reuses the comma-formatting/paste-sanitizing behavior of <Input>.
const CellInput = ({ value, onChange, onKeyDown, onBlur, autoFocus }) => {
  const [display, setDisplay] = useState(() => formatComma(String(value ?? 0)));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDisplay(formatComma(String(value ?? 0)));
  }, [value]);
  return (
    <input
      type="text"
      inputMode="decimal"
      autoFocus={autoFocus}
      value={display}
      onFocus={e => { focused.current = true; e.target.select(); }}
      onPaste={e => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/[$,\s]/g, "");
        if (pasted === "" || /^-?\d*\.?\d*$/.test(pasted)) {
          setDisplay(formatComma(pasted));
          const num = parseFloat(pasted);
          onChange(isNaN(num) ? 0 : num);
        }
      }}
      onChange={e => {
        const raw = e.target.value.replace(/,/g, "");
        if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
          setDisplay(formatComma(raw));
          const num = parseFloat(raw);
          onChange(isNaN(num) ? 0 : num);
        }
      }}
      onKeyDown={onKeyDown}
      onBlur={e => { focused.current = false; onBlur?.(e); }}
      style={cellInputStyle}
    />
  );
};

// ═════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════
export default function BudgetDashboard() {
  const [tab, setTab] = useState("overview");
  const { isReady, accounts, setAccounts, budget, setBudget, personalCategories, setPersonalCategories, businessBudget, setBusinessBudget, businessCategories, setBusinessCategories, businessMonthly, setBusinessMonthly } = useBudgetData();
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingBalance, setEditingBalance] = useState(null); // { accountId, draft: string }
  const balanceCancelRef = useRef(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "Checking", balance: 0 });
  const [overviewRange, setOverviewRange] = useState("ytd");
  const [overviewMonth, setOverviewMonth] = useState(monthNames[new Date().getMonth()]);
  const [editingMonth, setEditingMonth] = useState(null);
  const [editingMonthDraft, setEditingMonthDraft] = useState(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ label: "", type: "expense" });
  const [managingBizCategories, setManagingBizCategories] = useState(false);
  const [newBizCategoryForm, setNewBizCategoryForm] = useState({ label: "", type: "expense" });
  const [editingBizMonth, setEditingBizMonth] = useState(null);
  const [editingBizMonthDraft, setEditingBizMonthDraft] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { table: "budget"|"business", monthIndex: 0–11, field: cat.id, value }

  // ── Responsive detection ─────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 760);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 980);
  useEffect(() => {
    const handle = () => {
      setIsMobile(window.innerWidth < 760);
      setIsDesktop(window.innerWidth >= 980);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ── Derived Data ─────────────────────────────────────────
  const safeAccounts = accounts || [];
  const safeBudget = budget || [];
  const safePersonalCategories = personalCategories || [];
  const safeBusinessCategories = businessCategories || [];
  const safeBusinessMonthly = businessMonthly || [];

  const totalDebt = useMemo(() =>
    safeAccounts.filter(a => a.type === "Credit Card").reduce((s, a) => s + a.balance, 0), [safeAccounts]);
  const totalCash = useMemo(() =>
    safeAccounts.filter(a => ["Checking", "Savings"].includes(a.type)).reduce((s, a) => s + a.balance, 0), [safeAccounts]);
  const totalChecking = useMemo(() =>
    safeAccounts.filter(a => a.type === "Checking").reduce((s, a) => s + a.balance, 0), [safeAccounts]);
  const totalInvestments = useMemo(() =>
    safeAccounts.filter(a => ["Investment", "Retirement"].includes(a.type)).reduce((s, a) => s + a.balance, 0), [safeAccounts]);
  const totalAssets = useMemo(() =>
    safeAccounts.filter(a => a.type === "Asset").reduce((s, a) => s + a.balance, 0), [safeAccounts]);

  // Live balances: while a balance cell is being edited, substitute its draft so
  // group subtotals and the Balances KPI cards update as the user types.
  const liveBalance = (a) =>
    editingBalance && editingBalance.accountId === a.id
      ? (parseFloat(editingBalance.draft.replace(/,/g, "")) || 0)
      : a.balance;
  const liveTotal = (filterFn) => safeAccounts.filter(filterFn).reduce((s, a) => s + liveBalance(a), 0);
  const liveCash = liveTotal(a => ["Checking", "Savings"].includes(a.type));
  const liveInvestments = liveTotal(a => ["Investment", "Retirement"].includes(a.type));
  const liveAssets = liveTotal(a => a.type === "Asset");
  const liveDebt = liveTotal(a => a.type === "Credit Card");
  const netWorth = useMemo(() => {
    const nw = netWorthItems.reduce((s, i) => s + i.value, 0);
    return nw;
  }, []);

  const totalIncomeAll = useMemo(() => safeBudget.reduce((s, b) => s + b.totalIncome, 0), [safeBudget]);
  const totalExpenseAll = useMemo(() => safeBudget.reduce((s, b) => s + b.totalExpense, 0), [safeBudget]);
  const latestBalance = safeBudget.length > 0 ? safeBudget[safeBudget.length - 1].balance : 0;

  const netWorthPie = useMemo(() =>
    netWorthItems.filter(i => i.value > 0).map(i => ({ ...i })), []);

  const MONTH_ORDER = monthNames;
  const CURRENT_MONTH_IDX = new Date().getMonth(); // 0-indexed current calendar month (e.g. June = 5)
  const monthlyBudget = safeBudget;

  // ── Dynamic date-range labels ─────────────────────────────
  const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const currentYear = new Date().getFullYear();
  const ytdLabel = `Jan – ${monthAbbr[CURRENT_MONTH_IDX]} ${currentYear}`;
  const monthLabel = `${monthAbbr[MONTH_ORDER.indexOf(overviewMonth)] || ""} ${currentYear}`;

  const overviewData = useMemo(() => {
    // YTD = Jan through the current calendar month inclusive (months 0..CURRENT_MONTH_IDX).
    // monthlyBudget always carries all 12 months (zero-filled), so empty months render as 0
    // rather than being omitted — that's what kept the chart from stopping early.
    if (overviewRange === "ytd") return monthlyBudget.filter((_, i) => i <= CURRENT_MONTH_IDX);
    if (overviewRange === "month") return monthlyBudget.filter(r => r.period === overviewMonth);
    return monthlyBudget; // Full Year — all 12 months
  }, [overviewRange, overviewMonth, monthlyBudget]);
  const overviewIncome = useMemo(() => {
    const incCats = safePersonalCategories.filter(c => c.type === "income");
    return overviewData.reduce((s, r) => s + incCats.reduce((si, c) => si + (r[c.id] || 0), 0), 0);
  }, [overviewData, safePersonalCategories]);
  const overviewExpenses = useMemo(() => {
    const expCats = safePersonalCategories.filter(c => c.type === "expense");
    return overviewData.reduce((s, r) => s + expCats.reduce((se, c) => se + (r[c.id] || 0), 0), 0);
  }, [overviewData, safePersonalCategories]);

  // Expense breakdown donut — reflects the selected range (YTD = Jan–current month).
  const expenseBreakdown = useMemo(() => {
    const expCats = safePersonalCategories.filter(c => c.type === "expense");
    const totals = {};
    expCats.forEach(c => { totals[c.label] = 0; });
    overviewData.forEach(b => expCats.forEach(c => { totals[c.label] = (totals[c.label] || 0) + (b[c.id] || 0); }));
    return Object.entries(totals).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [overviewData, safePersonalCategories]);

  // Running balance — always all 12 months, but the line only connects through the current
  // month. Later months are null so Recharts renders a gap (line ends at the current month)
  // instead of dropping/trailing flat across the rest of the year.
  const runningBalanceData = useMemo(() =>
    monthlyBudget.map((r, i) => ({ ...r, balance: i <= CURRENT_MONTH_IDX ? r.balance : null })),
  [monthlyBudget, CURRENT_MONTH_IDX]);

  // businessMonthly is now the editable monthly state (replaces derived monthlyBusinessBudget)

  // ── Handlers ─────────────────────────────────────────────
  const updateAccount = useCallback((updated) => {
    setAccounts(prev => prev.map(a =>
      a.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString().split("T")[0] } : a
    ));
  }, []);

  // Commit the inline-edited balance for account `a` (reads editingBalance.draft).
  const saveBalance = (a) => {
    if (!editingBalance) return;
    const num = parseFloat(editingBalance.draft.replace(/,/g, ""));
    updateAccount({ ...a, balance: isNaN(num) ? 0 : num });
    setEditingBalance(null);
  };

  const addAccount = useCallback(() => {
    setAccounts(prev => [...prev, {
      id: Math.max(...prev.map(a => a.id)) + 1,
      ...newAccount,
      lastUpdated: new Date().toISOString().split("T")[0]
    }]);
    setNewAccount({ name: "", type: "Checking", balance: 0 });
    setAddingAccount(false);
  }, [newAccount]);

  const removeAccount = useCallback((id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  const updatePeriod = useCallback((index, field, value) => {
    setBudget(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      const p = updated[index];
      p.totalIncome = personalCategories.filter(c => c.type === "income").reduce((s, c) => s + (p[c.id] || 0), 0);
      p.totalExpense = personalCategories
        .filter(c => c.type === "expense")
        .reduce((s, c) => s + (p[c.id] || 0), 0);
      p.balance = p.totalIncome - p.totalExpense;
      return updated;
    });
  }, [personalCategories]);

  // ── Month-row save (shared by inline editing + edit modals) ──
  const savePersonalMonth = useCallback((d) => {
    const totalIncome = personalCategories.filter(c => c.type === "income").reduce((s, c) => s + (d[c.id] || 0), 0);
    const totalExpense = personalCategories.filter(c => c.type === "expense").reduce((s, c) => s + (d[c.id] || 0), 0);
    setBudget(prev => prev.map(r =>
      r.period === d.period ? { ...d, totalIncome, totalExpense, balance: totalIncome - totalExpense } : r
    ));
  }, [personalCategories]);

  const saveBizMonth = useCallback((d) => {
    setBusinessMonthly(prev => prev.map(r => r.period === d.period ? { ...d } : r));
  }, []);

  // ── Render helpers for Budget / Business tabs ─────────────
  const sumByType = (rows, cats, type) =>
    rows.reduce((s, r) => s + cats.filter(c => c.type === type).reduce((sc, c) => sc + (r[c.id] || 0), 0), 0);

  const renderSummaryCards = (rows, cats) => {
    const inc = sumByType(rows, cats, "income");
    const exp = sumByType(rows, cats, "expense");
    const net = inc - exp;
    const months = rows.filter(r => cats.some(c => (r[c.id] || 0) !== 0)).length;
    return (
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}>
        <KPI title="Total Income YTD" value={fmtFull(inc)} accent={T.copper} color={T.green} />
        <KPI title="Total Expenses YTD" value={fmtFull(exp)} accent={T.red} color={T.red} />
        <KPI title="Net Balance" value={fmtFull(net)} accent={T.green} color={net < 0 ? T.red : T.green} />
        <KPI title="Months Entered" value={String(months)} accent={T.copper} color={T.dark} />
      </div>
    );
  };

  // Transposed budget table: categories down the side, months across the top.
  // Desktop only; single-cell inline editing via editingCell.
  const renderTransposedBudget = (rows, cats, tableKey) => {
    const incCats = cats.filter(c => c.type === "income");
    const expCats = cats.filter(c => c.type === "expense");
    const saveCell = tableKey === "budget" ? savePersonalMonth : saveBizMonth;
    const nCols = rows.length + 2; // label + months + total

    // Effective value, applying the in-progress edit so totals update live.
    const cellVal = (m, catId) =>
      editingCell && editingCell.table === tableKey && editingCell.monthIndex === m && editingCell.field === catId
        ? editingCell.value
        : (rows[m]?.[catId] || 0);
    const sumTypeMonth = (m, type) => (type === "income" ? incCats : expCats).reduce((s, c) => s + cellVal(m, c.id), 0);
    const rowTotal = (catId) => rows.reduce((s, _, m) => s + cellVal(m, catId), 0);
    const typeTotal = (type) => rows.reduce((s, _, m) => s + sumTypeMonth(m, type), 0);

    const commit = () => {
      if (!editingCell) return;
      const base = rows[editingCell.monthIndex];
      if (base) saveCell({ ...base, [editingCell.field]: editingCell.value });
      setEditingCell(null);
    };

    const ZEBRA = "#f7f5ef";
    const headerCell = { padding: "10px 12px", background: HEADER_BG, fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: T.fontSans };
    const dataCell = { textAlign: "right", padding: "12px 10px", minWidth: 90, fontFamily: T.fontSans, fontSize: 15 };
    const totalCol = { ...dataCell, fontWeight: 600, borderLeft: `1px solid ${T.border}` };
    const sticky = (bg, z = 2) => ({ position: "sticky", left: 0, background: bg, zIndex: z });
    const rowLabel = { ...sticky(T.surface), minWidth: 160, textAlign: "left", color: T.dark, fontSize: 15, padding: "12px 16px", fontFamily: T.fontSans };
    const subtotalLabel = { fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.dark, fontFamily: T.fontSans, padding: "12px 16px", textAlign: "left" };
    const fmtCell = (v) => v === 0 ? "—" : fmtFull(v);

    let dataRowIdx = 0; // continuous counter for alternating row backgrounds

    const sectionHeader = (label) => (
      <tr key={`sec-${label}`}>
        <td colSpan={nCols} style={{ background: HEADER_BG, padding: "10px 16px" }}>
          <span style={{ position: "sticky", left: 16, display: "inline-block", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted, fontFamily: T.fontSans, fontWeight: 600 }}>{label}</span>
        </td>
      </tr>
    );

    const catRow = (cat) => {
      const zebra = dataRowIdx % 2 === 1 ? ZEBRA : "transparent";
      const stickyBg = dataRowIdx % 2 === 1 ? ZEBRA : T.surface;
      dataRowIdx += 1;
      return (
        <tr key={cat.id}>
          <td style={{ ...rowLabel, background: stickyBg }}>{cat.label}</td>
          {rows.map((_, m) => {
            const isEditing = editingCell && editingCell.table === tableKey && editingCell.monthIndex === m && editingCell.field === cat.id;
            if (isEditing) {
              return (
                <td key={m} style={{ ...dataCell, padding: "4px 8px", background: zebra }}>
                  <CellInput
                    value={editingCell.value}
                    autoFocus
                    onChange={v => setEditingCell(c => ({ ...c, value: v }))}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); commit(); }
                      else if (e.key === "Escape") { e.preventDefault(); setEditingCell(null); }
                    }}
                    onBlur={commit}
                  />
                </td>
              );
            }
            const v = cellVal(m, cat.id);
            return (
              <td key={m} style={{ ...dataCell, background: zebra, color: v === 0 ? T.faint : T.dark, cursor: "pointer" }}
                onClick={() => setEditingCell({ table: tableKey, monthIndex: m, field: cat.id, value: rows[m]?.[cat.id] || 0 })}>
                {fmtCell(v)}
              </td>
            );
          })}
          <td style={{ ...totalCol, background: zebra, color: T.dark }}>{fmtCell(rowTotal(cat.id))}</td>
        </tr>
      );
    };

    const subtotalRow = (label, type, valColor) => (
      <tr key={`sub-${type}`} style={{ background: HEADER_BG }}>
        <td style={{ ...subtotalLabel, ...sticky(HEADER_BG) }}>{label}</td>
        {rows.map((_, m) => {
          const v = sumTypeMonth(m, type);
          return <td key={m} style={{ ...dataCell, fontWeight: 600, color: v === 0 ? T.faint : valColor }}>{fmtCell(v)}</td>;
        })}
        <td style={{ ...totalCol, color: valColor }}>{fmtCell(typeTotal(type))}</td>
      </tr>
    );

    const balanceRow = () => {
      const topBorder = `2px solid ${T.border}`;
      const grand = typeTotal("income") - typeTotal("expense");
      return (
        <tr style={{ background: T.surface }}>
          <td style={{ ...subtotalLabel, ...sticky(T.surface), borderTop: topBorder }}>Balance</td>
          {rows.map((_, m) => {
            const v = sumTypeMonth(m, "income") - sumTypeMonth(m, "expense");
            return <td key={m} style={{ ...dataCell, fontWeight: 600, color: v < 0 ? T.red : T.green, borderTop: topBorder }}>{fmtFull(v)}</td>;
          })}
          <td style={{ ...totalCol, color: grand < 0 ? T.red : T.green, borderTop: topBorder }}>{fmtFull(grand)}</td>
        </tr>
      );
    };

    return (
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", background: T.surface, border: `1px solid ${T.border}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: T.fontSans }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, ...sticky(HEADER_BG, 3), minWidth: 160, textAlign: "left" }}></th>
              {rows.map((r, m) => (
                <th key={m} style={{ ...headerCell, textAlign: "right", color: m > CURRENT_MONTH_IDX ? T.faint : T.dark }}>{r.period.slice(0, 3)}</th>
              ))}
              <th style={{ ...headerCell, textAlign: "right", borderLeft: `1px solid ${T.border}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sectionHeader("Income")}
            {incCats.map(catRow)}
            {subtotalRow("Total In", "income", T.dark)}
            {sectionHeader("Expenses")}
            {expCats.map(catRow)}
            {subtotalRow("Total Exp", "expense", T.red)}
            {balanceRow()}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBudgetCards = (rows, cats, onEdit) => {
    const chipStyle = { background: CHIP_BG, fontSize: 13, padding: "4px 10px", letterSpacing: "0.02em", color: T.dark, fontFamily: T.fontSans };
    return (
      <div>
        {rows.map((row, i) => {
          const incCats = cats.filter(c => c.type === "income");
          const expCats = cats.filter(c => c.type === "expense");
          const totalIn = incCats.reduce((s, c) => s + (row[c.id] || 0), 0);
          const totalExp = expCats.reduce((s, c) => s + (row[c.id] || 0), 0);
          const bal = totalIn - totalExp;
          const empty = totalIn === 0 && totalExp === 0;
          const expChips = expCats.filter(c => (row[c.id] || 0) > 0).slice(0, 3);
          return (
            <div key={i} style={{
              background: T.surface,
              border: empty ? `1px dashed ${T.border2}` : `1px solid ${T.border}`,
              padding: "20px 22px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: T.fontSans, fontSize: 17, fontWeight: 600, color: T.dark }}>{row.period}</span>
                {empty
                  ? <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.faint }}>No data yet</span>
                  : <span style={{ fontFamily: T.fontSerif, fontSize: "1.6rem", fontWeight: 600, color: bal < 0 ? T.red : T.green }}>{fmtFull(bal)}</span>}
              </div>
              {!empty && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                  <span style={chipStyle}>Income {fmtFull(totalIn)}</span>
                  <span style={chipStyle}>Expenses {fmtFull(totalExp)}</span>
                  {expChips.map(c => <span key={c.id} style={chipStyle}>{c.label} {fmtFull(row[c.id])}</span>)}
                </div>
              )}
              <button onClick={() => onEdit(row)} style={{ ...editBtnStyle, width: "100%", padding: 10, marginTop: 16, minHeight: 48 }}>Edit</button>
            </div>
          );
        })}
      </div>
    );
  };

  const TABS = [
    ["overview", "Overview"],
    ["budget", "Budget"],
    ["business", "Business"],
    ["balances", "Balances"],
    ["networth", "Net Worth"],
  ];

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      color: T.dark, fontFamily: T.fontSans, fontSize: 16,
    }}>
      {!isReady && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: T.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.muted, fontSize: 18, fontFamily: T.fontSerif,
        }}>
          Loading…
        </div>
      )}
      {/* Header */}
      <div style={{
        background: "rgba(244,241,234,0.92)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{
          maxWidth: 1480, margin: "0 auto", padding: "18px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div>
              <span style={{ fontFamily: T.fontSerif, fontWeight: 600, fontSize: 26, color: T.dark }}>LOTUS</span>
              <span style={{ fontFamily: T.fontSerif, fontWeight: 300, fontStyle: "italic", fontSize: 26, color: T.dark, marginLeft: 5 }}>LEDGER</span>
            </div>
            <div style={{
              fontFamily: T.fontSans, fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase", color: T.copper, marginTop: 4,
            }}>Personal Finance · 2026</div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {TABS.map(([key, label]) => (
                <TabBtn key={key} active={tab === key} onClick={() => setTab(key)}>{label}</TabBtn>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: `28px 28px ${isMobile ? 110 : 70}px`, animation: "lotusFade 0.4s ease" }}>

      {/* ════ OVERVIEW TAB ════ */}
      {tab === "overview" && (
        <>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, padding: 3, display: "inline-flex", gap: 2 }}>
              {[["ytd","YTD"],["month","Monthly"],["forecast","Full Year"]].map(([r,label]) => (
                <button key={r} onClick={() => setOverviewRange(r)} style={{
                  padding: "6px 16px", fontSize: 10, fontFamily: T.fontSans,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: overviewRange === r ? T.dark : "transparent",
                  color: overviewRange === r ? T.bg : T.muted,
                }}>{label}</button>
              ))}
            </div>
            {overviewRange === "month" && (
              <select value={overviewMonth} onChange={e => setOverviewMonth(e.target.value)} style={{
                padding: "8px 12px", border: `1px solid ${T.border2}`,
                background: T.surface, color: T.dark, fontSize: 11,
                fontFamily: T.fontSans, cursor: "pointer",
              }}>
                {MONTH_ORDER.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Income" value={fmtFull(overviewIncome)}
              subtitle={overviewRange === "ytd" ? ytdLabel : overviewRange === "month" ? monthLabel : `Full Year ${currentYear}`}
              accent={T.green} color={T.green} />
            <KPI title="Expenses" value={fmtFull(overviewExpenses)}
              subtitle={overviewRange === "ytd" ? ytdLabel : overviewRange === "month" ? monthLabel : `Full Year ${currentYear}`}
              accent={T.red} color={T.red} />
            <KPI title="Checking Balance" value={fmtFull(totalChecking)} subtitle="Sum of checking accounts" accent={T.copper} color={T.dark} />
            <KPI title="Credit Card Balance" value={fmtFull(totalDebt)} accent={T.red} negative={totalDebt > 0} color={T.red} />
          </div>

          <div style={{ display: "flex", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
            <Card style={{ flex: "2 1 450px" }}>
              <CardTitle>Income vs Expenses by Month</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={overviewData}>
                  <defs>
                    <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.green} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={T.green} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.red} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={T.red} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} strokeWidth={0.5} />
                  <XAxis dataKey="period" tick={{ fill: T.faint, fontSize: 9, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} />
                  <YAxis tickFormatter={fmt} tick={{ fill: T.faint, fontSize: 9, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="totalIncome" stroke={T.green} strokeWidth={2} fill="url(#incG)" name="Income" />
                  <Area type="monotone" dataKey="totalExpense" stroke={T.red} strokeWidth={2} fill="url(#expG)" name="Expenses" />
                  <Legend wrapperStyle={{ color: T.muted, fontSize: 10, fontFamily: "Inter", paddingTop: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ flex: "1 1 280px" }}>
              <CardTitle>Expense Breakdown ({overviewRange === "ytd" ? "YTD" : overviewRange === "month" ? overviewMonth : "Full Year"})</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                    {expenseBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: T.surface, border: `1px solid ${T.border2}`, color: T.dark }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", marginTop: 14 }}>
                {expenseBreakdown.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: T.muted }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                    {e.name}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <CardTitle>Running Balance Over Time</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={runningBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} strokeWidth={0.5} />
                <XAxis dataKey="period" tick={{ fill: T.faint, fontSize: 9, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: T.faint, fontSize: 9, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="balance" stroke={T.copper} strokeWidth={2} dot={{ r: 4, fill: T.copper, stroke: T.surface, strokeWidth: 2 }} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* ════ BUDGET TAB ════ */}
      {tab === "budget" && (
        <>
          {renderSummaryCards(monthlyBudget, personalCategories)}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <CardTitle>Personal Budget — 2026 (Monthly)</CardTitle>
              <Btn variant="primary" onClick={() => setManagingCategories(true)}>Manage Categories</Btn>
            </div>
            {isMobile
              ? renderBudgetCards(monthlyBudget, personalCategories, (row) => { setEditingMonthDraft({ ...row }); setEditingMonth(row.period); })
              : renderTransposedBudget(monthlyBudget, personalCategories, "budget")}
          </Card>
        </>
      )}

      {/* ════ BUSINESS TAB ════ */}
      {tab === "business" && (
        <>
          {renderSummaryCards(businessMonthly, businessCategories)}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <CardTitle>Business Budget — 2026 (Monthly)</CardTitle>
              <Btn variant="primary" onClick={() => setManagingBizCategories(true)}>Manage Categories</Btn>
            </div>
            {isMobile
              ? renderBudgetCards(businessMonthly, businessCategories, (row) => { setEditingBizMonthDraft({ ...row }); setEditingBizMonth(row.period); })
              : renderTransposedBudget(businessMonthly, businessCategories, "business")}
          </Card>
        </>
      )}

      {/* ════ BALANCES TAB ════ */}
      {tab === "balances" && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Cash & Checking" value={fmtFull(liveCash)} accent={T.green} color={T.green} />
            <KPI title="Investments & Retirement" value={fmtFull(liveInvestments)} accent={T.copper} color={T.dark} />
            <KPI title="Real Estate & Assets" value={fmtFull(liveAssets)} accent={T.copper} color={T.dark} />
            <KPI title="Credit Card Debt" value={fmtFull(liveDebt)} accent={T.red} negative={liveDebt > 0} color={T.red} />
          </div>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
              <CardTitle>Account Balances</CardTitle>
              <Btn onClick={() => setAddingAccount(true)} variant="primary">+ Add Account</Btn>
            </div>
            <div>
              {BALANCE_GROUPS.map((group, gi) => {
                const groupAccounts = safeAccounts.filter(a => group.types.includes(a.type));
                if (groupAccounts.length === 0) return null;
                const subtotal = groupAccounts.reduce((s, a) => s + liveBalance(a), 0);
                return (
                  <div key={group.label} style={{ marginTop: gi === 0 ? 0 : 20 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "baseline",
                      fontFamily: T.fontSans, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: T.muted, padding: "16px 18px 8px", borderBottom: `1px solid ${T.border}`,
                    }}>
                      <span>{group.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: group.debt ? T.red : T.dark }}>{fmtFull(subtotal)}</span>
                    </div>
                    {groupAccounts.map((a) => {
                      const isDebt = a.type === "Credit Card";
                      return (
                        <div key={a.id} style={{
                          display: "flex", flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between",
                          gap: isMobile ? 12 : 16,
                          background: T.surface, border: `1px solid ${T.border}`, padding: "14px 18px", paddingLeft: 28, marginBottom: 6,
                        }}>
                          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 6 : 12 }}>
                            <span style={{ fontFamily: T.fontSans, fontSize: 15, color: T.dark }}>{a.name}</span>
                            <span style={{
                              display: "inline-block", padding: "3px 9px",
                              fontFamily: T.fontSans, fontSize: 12, fontWeight: 500,
                              letterSpacing: "0.08em", textTransform: "uppercase",
                              background: CHIP_BG, color: isDebt ? T.red : T.dark,
                            }}>{a.type}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-end", gap: 16, width: isMobile ? "100%" : "auto" }}>
                            <div style={{ textAlign: isMobile ? "left" : "right" }}>
                              {editingBalance && editingBalance.accountId === a.id ? (
                                <input
                                  autoFocus
                                  type="text"
                                  inputMode="decimal"
                                  value={editingBalance.draft}
                                  onFocus={e => e.target.select()}
                                  onChange={e => {
                                    const raw = e.target.value.replace(/,/g, "");
                                    if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) setEditingBalance({ accountId: a.id, draft: formatComma(raw) });
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
                                    else if (e.key === "Escape") { e.preventDefault(); balanceCancelRef.current = true; e.currentTarget.blur(); }
                                  }}
                                  onBlur={() => {
                                    if (balanceCancelRef.current) { balanceCancelRef.current = false; setEditingBalance(null); return; }
                                    saveBalance(a);
                                  }}
                                  style={{ background: "#fff", border: `1px solid ${T.green}`, padding: "4px 8px", textAlign: "right", fontFamily: T.fontSans, fontSize: 15, width: 120, outline: "none" }}
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingBalance({ accountId: a.id, draft: formatComma(String(a.balance)) })}
                                  onMouseEnter={e => e.currentTarget.style.borderBottomColor = T.green}
                                  onMouseLeave={e => e.currentTarget.style.borderBottomColor = "transparent"}
                                  style={{ display: "inline-block", fontFamily: T.fontSans, fontWeight: 500, fontSize: 15, color: isDebt && a.balance > 0 ? T.red : T.dark, cursor: "pointer", borderBottom: "1px solid transparent" }}
                                >{fmtFull(a.balance)}</div>
                              )}
                              <div style={{ fontSize: 13, color: T.faint, fontFamily: T.fontSans }}>{a.lastUpdated}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => removeAccount(a.id)} style={removeBtnStyle}>Remove</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* ════ NET WORTH TAB ════ */}
      {tab === "networth" && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Total Net Worth" value={fmtFull(netWorth)} accent={T.copper} color={T.dark} />
            <KPI title="Liquid Assets" value={fmtFull(240000)} subtitle="Savings" accent={T.green} color={T.green} />
            <KPI title="Real Estate" value={fmtFull(2000000)} subtitle="Home value" accent={T.copper} color={T.dark} />
            <KPI title="Retirement" value={fmtFull(390000)} subtitle="All retirement accounts" accent={T.green} color={T.green} />
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Card style={{ flex: "1 1 350px" }}>
              <CardTitle>Net Worth Composition</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={netWorthPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2} strokeWidth={0}>
                    {netWorthPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: T.surface, border: `1px solid ${T.border2}`, color: T.dark }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "center", marginTop: 14 }}>
                {netWorthPie.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: T.muted }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                    {e.name}: {fmtFull(e.value)}
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ flex: "1 1 350px" }}>
              <CardTitle>Asset Breakdown</CardTitle>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={netWorthPie} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} strokeWidth={0.5} />
                  <XAxis type="number" tickFormatter={fmt} tick={{ fill: T.faint, fontSize: 9, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: T.faint, fontSize: 10, fontFamily: "Inter" }} axisLine={{ stroke: T.border }} tickLine={false} width={120} />
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: T.surface, border: `1px solid ${T.border2}`, color: T.dark }} />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                    {netWorthPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* ════ MODALS ════ */}
      {editingAccount && (
        <Modal title="Edit Account" onClose={() => setEditingAccount(null)}>
          <Input label="Account Name" type="text" value={editingAccount.name} onChange={v => setEditingAccount({ ...editingAccount, name: v })} />
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Type</label>
            <select
              value={editingAccount.type}
              onChange={e => setEditingAccount({ ...editingAccount, type: e.target.value })}
              style={fieldStyle}
            >
              {["Checking", "Savings", "Credit Card", "Investment", "Retirement", "Asset"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input label="Balance" comma value={editingAccount.balance} onChange={v => setEditingAccount({ ...editingAccount, balance: v })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setEditingAccount(null)}>Cancel</Btn>
            <Btn onClick={() => { updateAccount(editingAccount); setEditingAccount(null); }}>Save</Btn>
          </div>
        </Modal>
      )}

      {editingMonth && editingMonthDraft && (
        <Modal title={editingMonth} onClose={() => { setEditingMonth(null); setEditingMonthDraft(null); }}>
          {personalCategories.filter(c => c.type === "income").length > 0 && (
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 8, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Income</div>
          )}
          {personalCategories.filter(c => c.type === "income").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingMonthDraft[cat.id] || 0}
              onChange={v => setEditingMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          {personalCategories.filter(c => c.type === "expense").length > 0 && (
            <div style={{ fontSize: 10, color: T.muted, margin: "16px 0 10px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Expenses</div>
          )}
          {personalCategories.filter(c => c.type === "expense").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingMonthDraft[cat.id] || 0}
              onChange={v => setEditingMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="secondary" onClick={() => { setEditingMonth(null); setEditingMonthDraft(null); }}>Cancel</Btn>
            <Btn onClick={() => {
              savePersonalMonth(editingMonthDraft);
              setEditingMonth(null);
              setEditingMonthDraft(null);
            }}>Save</Btn>
          </div>
        </Modal>
      )}

      {addingAccount && (
        <Modal title="Add New Account" onClose={() => setAddingAccount(false)}>
          <Input label="Account Name" value={newAccount.name} type="text" onChange={v => setNewAccount(p => ({ ...p, name: v }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Type</label>
            <select
              value={newAccount.type}
              onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))}
              style={fieldStyle}
            >
              {["Checking", "Savings", "Credit Card", "Investment", "Retirement", "Asset"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input label="Balance" comma value={newAccount.balance} onChange={v => setNewAccount(p => ({ ...p, balance: v }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setAddingAccount(false)}>Cancel</Btn>
            <Btn onClick={addAccount}>Add Account</Btn>
          </div>
        </Modal>
      )}

      {managingCategories && (
        <Modal title="Manage Categories" onClose={() => setManagingCategories(false)}>
          <div style={{ marginBottom: 4 }}>
            {personalCategories.length === 0 && (
              <div style={{ color: T.muted, fontSize: 12, padding: "8px 0" }}>No categories yet.</div>
            )}
            {personalCategories.map((cat, idx) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                {/* Up / Down */}
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button disabled={idx === 0} onClick={() => setPersonalCategories(prev => {
                    const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? T.border2 : T.muted, fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▲</button>
                  <button disabled={idx === personalCategories.length - 1} onClick={() => setPersonalCategories(prev => {
                    const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === personalCategories.length - 1 ? "default" : "pointer", color: idx === personalCategories.length - 1 ? T.border2 : T.muted, fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▼</button>
                </div>
                {/* Inline rename input */}
                <input
                  value={cat.label}
                  onChange={e => setPersonalCategories(prev => prev.map((c, i) => i === idx ? { ...c, label: e.target.value } : c))}
                  style={{ flex: 1, padding: "5px 8px", background: T.bg, border: `1px solid ${T.border2}`, fontSize: 13, color: T.dark, fontFamily: T.fontSans, outline: "none" }}
                />
                {/* Type badge */}
                <span style={{ fontSize: 10, color: cat.type === "income" ? T.green : T.muted, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>{cat.type}</span>
                {/* Remove */}
                <button onClick={() => setPersonalCategories(prev => prev.filter((_, i) => i !== idx))} style={{
                  background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans }}>Add Category</div>
            <Input label="Label" type="text" value={newCategoryForm.label} onChange={v => setNewCategoryForm(p => ({ ...p, label: v }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Type</label>
              <select value={newCategoryForm.type} onChange={e => setNewCategoryForm(p => ({ ...p, type: e.target.value }))} style={fieldStyle}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn onClick={() => {
                const label = newCategoryForm.label.trim();
                if (!label) return;
                const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                setPersonalCategories(prev => [...prev, { id, label, type: newCategoryForm.type }]);
                setNewCategoryForm({ label: "", type: "expense" });
              }}>Add</Btn>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="secondary" onClick={() => setManagingCategories(false)}>Done</Btn>
          </div>
        </Modal>
      )}

      {editingBizMonth && editingBizMonthDraft && (
        <Modal title={editingBizMonth} onClose={() => { setEditingBizMonth(null); setEditingBizMonthDraft(null); }}>
          {businessCategories.filter(c => c.type === "income").length > 0 && (
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 8, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Income</div>
          )}
          {businessCategories.filter(c => c.type === "income").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingBizMonthDraft[cat.id] || 0}
              onChange={v => setEditingBizMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          {businessCategories.filter(c => c.type === "expense").length > 0 && (
            <div style={{ fontSize: 10, color: T.muted, margin: "16px 0 10px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Expenses</div>
          )}
          {businessCategories.filter(c => c.type === "expense").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingBizMonthDraft[cat.id] || 0}
              onChange={v => setEditingBizMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="secondary" onClick={() => { setEditingBizMonth(null); setEditingBizMonthDraft(null); }}>Cancel</Btn>
            <Btn onClick={() => {
              saveBizMonth(editingBizMonthDraft);
              setEditingBizMonth(null);
              setEditingBizMonthDraft(null);
            }}>Save</Btn>
          </div>
        </Modal>
      )}

      {managingBizCategories && (
        <Modal title="Manage Business Categories" onClose={() => setManagingBizCategories(false)}>
          <div style={{ marginBottom: 4 }}>
            {businessCategories.length === 0 && (
              <div style={{ color: T.muted, fontSize: 12, padding: "8px 0" }}>No categories yet.</div>
            )}
            {businessCategories.map((cat, idx) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button disabled={idx === 0} onClick={() => setBusinessCategories(prev => {
                    const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? T.border2 : T.muted, fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▲</button>
                  <button disabled={idx === businessCategories.length - 1} onClick={() => setBusinessCategories(prev => {
                    const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === businessCategories.length - 1 ? "default" : "pointer", color: idx === businessCategories.length - 1 ? T.border2 : T.muted, fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▼</button>
                </div>
                <input
                  value={cat.label}
                  onChange={e => setBusinessCategories(prev => prev.map((c, i) => i === idx ? { ...c, label: e.target.value } : c))}
                  style={{ flex: 1, padding: "5px 8px", background: T.bg, border: `1px solid ${T.border2}`, fontSize: 13, color: T.dark, fontFamily: T.fontSans, outline: "none" }}
                />
                <span style={{ fontSize: 10, color: cat.type === "income" ? T.green : T.muted, fontFamily: T.fontSans, textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>{cat.type}</span>
                <button onClick={() => setBusinessCategories(prev => prev.filter((_, i) => i !== idx))} style={{
                  background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 10, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: T.fontSans }}>Add Category</div>
            <Input label="Label" type="text" value={newBizCategoryForm.label} onChange={v => setNewBizCategoryForm(p => ({ ...p, label: v }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Type</label>
              <select value={newBizCategoryForm.type} onChange={e => setNewBizCategoryForm(p => ({ ...p, type: e.target.value }))} style={fieldStyle}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn onClick={() => {
                const label = newBizCategoryForm.label.trim();
                if (!label) return;
                const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                setBusinessCategories(prev => [...prev, { id, label, type: newBizCategoryForm.type }]);
                setNewBizCategoryForm({ label: "", type: "expense" });
              }}>Add</Btn>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn variant="secondary" onClick={() => setManagingBizCategories(false)}>Done</Btn>
          </div>
        </Modal>
      )}

      </div>

      {/* Mobile bottom tab bar — sits above the footer so both stay visible */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 40, left: 0, right: 0, zIndex: 491,
          background: "rgba(244,241,234,0.96)", backdropFilter: "blur(14px)",
          borderTop: `1px solid ${T.border}`, display: "flex",
        }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "12px 4px 16px", textAlign: "center", fontFamily: T.fontSans,
              fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              border: "none", background: "transparent", color: tab === key ? T.green : T.muted,
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* Fixed footer bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 40, zIndex: 490,
        background: "#1a1a18", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <a href="https://getlotusai.com" target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none",
        }}>
          <img src="/lotus-logo.png" alt="Lotus AI" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <span style={{
            fontFamily: T.fontSans, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
          }}>Powered by Lotus AI</span>
        </a>
      </div>
    </div>
  );
}
