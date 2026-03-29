import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// ── Real Data from Budget.xlsx ──────────────────────────────
const initialAccounts = [
  { id: 1, name: "Chase Sapphire", type: "Credit Card", balance: 0, lastUpdated: "2026-03-29" },
  { id: 2, name: "Capital One MC", type: "Credit Card", balance: 1320.23, lastUpdated: "2026-03-29" },
  { id: 3, name: "Marriott Amex", type: "Credit Card", balance: 1273.03, lastUpdated: "2026-03-29" },
  { id: 4, name: "Home Equity", type: "Asset", balance: 270000, lastUpdated: "2026-03-29" },
  { id: 5, name: "Saiyini CA", type: "Asset", balance: 106000, lastUpdated: "2026-03-29" },
  { id: 6, name: "Fidelity", type: "Investment", balance: 51000, lastUpdated: "2026-03-29" },
  { id: 7, name: "SDI 401k", type: "Retirement", balance: 12465, lastUpdated: "2026-03-29" },
  { id: 8, name: "BofA Personal", type: "Checking", balance: 423.34, lastUpdated: "2026-03-29" },
  { id: 9, name: "Saiyini", type: "Checking", balance: 2032.23, lastUpdated: "2026-03-29" },
  { id: 10, name: "BofA Business", type: "Checking", balance: 6066.41, lastUpdated: "2026-03-29" },
];

const payPeriods = [
  "Jan 2", "Jan 16", "Jan 30", "Feb 13", "Feb 27", "Mar 13", "Mar 27",
  "Apr 10", "Apr 24", "May 8", "May 22", "Jun 5", "Jun 19",
  "Jul 2", "Jul 16", "Jul 30", "Aug 13", "Aug 27",
  "Sep 10", "Sep 24", "Oct 8", "Oct 22", "Nov 5", "Nov 19", "Dec 3", "Dec 17"
];

const initialBudgetData = [
  { period: "Jan 2", carryover: 4525.15, income: 0, misc: 0, totalIncome: 4525.15, mortgage: 0, water: 0, housekeeping: 0, preschool: 0, cash: 0, chase: 1000, robinhood: 0, totalExpense: 1000, balance: 200 },
  { period: "Jan 16", carryover: 200, income: 1700, misc: 0, totalIncome: 1900, mortgage: 0, water: 0, housekeeping: 175, preschool: 0, cash: 125, chase: 900, robinhood: 0, totalExpense: 1200, balance: 700 },
  { period: "Jan 30", carryover: 400, income: 14000, misc: 0, totalIncome: 14400, mortgage: 4210, water: 0, housekeeping: 175, preschool: 1900, cash: 0, chase: 2000, robinhood: 5000, totalExpense: 13285, balance: 1115 },
  { period: "Feb 13", carryover: 1115, income: 0, misc: 0, totalIncome: 1115, mortgage: 0, water: 0, housekeeping: 175, preschool: 0, cash: 125, chase: 900, robinhood: 0, totalExpense: 1200, balance: -85 },
  { period: "Feb 27", carryover: 11000, income: 7000, misc: 0, totalIncome: 18000, mortgage: 4210, water: 0, housekeeping: 0, preschool: 1900, cash: 0, chase: 2000, robinhood: 8000, totalExpense: 16110, balance: 1890 },
  { period: "Mar 13", carryover: 1890, income: 1700, misc: 0, totalIncome: 3590, mortgage: 0, water: 0, housekeeping: 175, preschool: 0, cash: 125, chase: 900, robinhood: 0, totalExpense: 1200, balance: 2390 },
  { period: "Mar 27", carryover: 2390, income: 9000, misc: 0, totalIncome: 11390, mortgage: 4210, water: 370.16, housekeeping: 0, preschool: 1900, cash: 0, chase: 836.87, robinhood: 0, totalExpense: 7317.03, balance: 4072.97 },
  { period: "Apr 10", carryover: 4072.97, income: 1700, misc: 0, totalIncome: 5772.97, mortgage: 0, water: 0, housekeeping: 175, preschool: 0, cash: 125, chase: 900, robinhood: 0, totalExpense: 1200, balance: 4572.97 },
  { period: "Apr 24", carryover: 3000, income: 7826, misc: 1800, totalIncome: 12626, mortgage: 4210, water: 670, housekeeping: 0, preschool: 1900, cash: 0, chase: 2600, robinhood: 0, totalExpense: 9380, balance: 3246 },
];

const businessPayPeriods = [
  "Jan 2","Jan 16","Jan 30","Feb 13","Feb 27","Mar 13","Mar 27",
  "Apr 10","Apr 24","May 8","May 22","Jun 5","Jun 19","Jul 3",
  "Jul 17","Jul 31","Aug 14","Aug 28","Sep 11","Sep 25","Oct 9",
  "Oct 23","Nov 6","Nov 20","Dec 4","Dec 18"
];

const initialBusinessData = [
  { period:"Jan 2",  carryover:0,    consulting:0,     sunderMed:0,    miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:0    },
  { period:"Jan 16", carryover:200,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:175, chase:1000, misc:0,    capitalOne:0    },
  { period:"Jan 30", carryover:8153, consulting:0,     sunderMed:0,    miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:0    },
  { period:"Feb 13", carryover:8153, consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:175, chase:1000, misc:0,    capitalOne:0    },
  { period:"Feb 27", carryover:9278, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11500, tax:0, healthInsurance:1900, autoLoan:0,   autoInsurance:252, utilities:160, chase:0,    misc:0,    capitalOne:1000 },
  { period:"Mar 13", carryover:8016, consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:175, chase:1000, misc:0,    capitalOne:0    },
  { period:"Mar 27", carryover:85,   consulting:14000, sunderMed:0,    miscTransfer:0, salary:11500, tax:0, healthInsurance:2000, autoLoan:0,   autoInsurance:252, utilities:160, chase:0,    misc:0,    capitalOne:0    },
  { period:"Apr 10", carryover:173,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:175, chase:1000, misc:0,    capitalOne:0    },
  { period:"Apr 24", carryover:117,  consulting:14000, sunderMed:0,    miscTransfer:0, salary:10765, tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:140, chase:0,    misc:0,    capitalOne:2500 },
  { period:"May 8",  carryover:712,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:0,   chase:1000, misc:0,    capitalOne:0    },
  { period:"May 22", carryover:524,  consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:2500 },
  { period:"Jun 5",  carryover:0,    consulting:0,     sunderMed:0,    miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:0    },
  { period:"Jun 19", carryover:200,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:250, utilities:245, chase:1000, misc:0,    capitalOne:0    },
  { period:"Jul 3",  carryover:5280, consulting:14000, sunderMed:0,    miscTransfer:0, salary:10764, tax:0, healthInsurance:2000, autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:240,  capitalOne:1500 },
  { period:"Jul 17", carryover:4776, consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:252, utilities:185, chase:1500, misc:500,  capitalOne:0    },
  { period:"Jul 31", carryover:4889, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:2000, autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:1000 },
  { period:"Aug 14", carryover:4689, consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:1000, misc:0,    capitalOne:0    },
  { period:"Aug 28", carryover:1500, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11500, tax:0, healthInsurance:2000, autoLoan:450, autoInsurance:252, utilities:185, chase:0,    misc:0,    capitalOne:1000 },
  { period:"Sep 11", carryover:113,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:1000, misc:0,    capitalOne:0    },
  { period:"Sep 25", carryover:1367, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:1900, autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:1000 },
  { period:"Oct 9",  carryover:975,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:252, utilities:185, chase:1000, misc:0,    capitalOne:1500 },
  { period:"Oct 23", carryover:588,  consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:1900, autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:1000 },
  { period:"Nov 6",  carryover:488,  consulting:0,     sunderMed:3000, miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:1000, misc:0,    capitalOne:0    },
  { period:"Nov 20", carryover:2488, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:1900, autoLoan:450, autoInsurance:252, utilities:185, chase:0,    misc:0,    capitalOne:1000 },
  { period:"Dec 4",  carryover:1000, consulting:14000, sunderMed:0,    miscTransfer:0, salary:11200, tax:0, healthInsurance:0,    autoLoan:450, autoInsurance:252, utilities:185, chase:1000, misc:1000, capitalOne:0    },
  { period:"Dec 18", carryover:913,  consulting:0,     sunderMed:0,    miscTransfer:0, salary:0,     tax:0, healthInsurance:0,    autoLoan:0,   autoInsurance:0,   utilities:0,   chase:0,    misc:0,    capitalOne:1000 },
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
const COLORS = {
  bg: "#0a1628",
  card: "linear-gradient(135deg, #0f2035 0%, #162d4a 100%)",
  border: "#1e3a5f",
  accent: "#3b82f6",
  accent2: "#2563eb",
  accent3: "#60a5fa",
  green: "#34d399",
  red: "#f87171",
  pink: "#f472b6",
  text: "#e2e8f0",
  textDim: "#64b5f6",
  textMuted: "#93c5fd",
};
const PIE_COLORS = ["#3b82f6", "#2563eb", "#60a5fa", "#93c5fd", "#34d399", "#fbbf24", "#f472b6"];

const Card = ({ children, style = {} }) => (
  <div style={{
    background: COLORS.card, borderRadius: 14,
    border: `1px solid ${COLORS.border}`, padding: 20, ...style
  }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 style={{ margin: "0 0 16px", fontSize: 15, color: COLORS.textMuted, fontWeight: 600 }}>{children}</h3>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f2035", border: `1px solid ${COLORS.accent}`, borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: COLORS.text
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: COLORS.textMuted }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tab Button ───────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14, transition: "all 0.2s",
    background: active ? COLORS.accent : "#0f2035",
    color: active ? "#fff" : COLORS.textMuted,
  }}>{children}</button>
);

// ── KPI Card ─────────────────────────────────────────────────
const KPI = ({ title, value, subtitle, color = COLORS.accent, negative = false }) => (
  <div style={{
    background: COLORS.card, borderRadius: 14, padding: "20px 22px",
    border: `1px solid ${COLORS.border}`, flex: "1 1 180px", position: "relative", overflow: "hidden",
    minWidth: 180,
  }}>
    <div style={{
      position: "absolute", top: -12, right: -12, width: 60, height: 60,
      borderRadius: "50%", background: color, opacity: 0.12
    }} />
    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: negative ? COLORS.red : COLORS.text }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>{subtitle}</div>}
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000
  }} onClick={onClose}>
    <div style={{
      background: "#0d1e36", borderRadius: 16, border: `1px solid ${COLORS.border}`,
      padding: 28, minWidth: 360, maxWidth: 500, maxHeight: "80vh", overflowY: "auto"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: COLORS.text, fontSize: 18 }}>{title}</h3>
        <button onClick={onClose} style={{
          background: "none", border: "none", color: COLORS.textDim, fontSize: 22, cursor: "pointer"
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, value, onChange, type = "number" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
      style={{
        width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
        background: "#091525", color: COLORS.text, fontSize: 14, outline: "none",
        boxSizing: "border-box",
      }}
    />
  </div>
);

const Btn = ({ onClick, children, variant = "primary", style = {} }) => (
  <button onClick={onClick} style={{
    padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: 14,
    background: variant === "primary" ? COLORS.accent : "#1e3a5f",
    color: "#fff", ...style
  }}>{children}</button>
);

// ── localStorage helpers ─────────────────────────────────────
const STORAGE_KEYS = { accounts: "budget_accounts", budget: "budget_data", netWorth: "budget_networth", businessBudget: "business_budget" };

const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
};

const saveState = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ═════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════
export default function BudgetDashboard() {
  const [tab, setTab] = useState("overview");
  const [accounts, setAccounts] = useState(() => loadState(STORAGE_KEYS.accounts, initialAccounts));
  const [budget, setBudget] = useState(() => {
    const saved = loadState(STORAGE_KEYS.budget, initialBudgetData);
    const savedPeriods = new Set(saved.map(r => r.period));
    const missing = payPeriods
      .filter(p => !savedPeriods.has(p))
      .map(p => ({ period: p, carryover: 0, income: 0, misc: 0, totalIncome: 0, mortgage: 0, water: 0, housekeeping: 0, preschool: 0, cash: 0, chase: 0, robinhood: 0, totalExpense: 0, balance: 0 }));
    if (!missing.length) return saved;
    return [...saved, ...missing].sort((a, b) => payPeriods.indexOf(a.period) - payPeriods.indexOf(b.period));
  });
  const [businessBudget, setBusinessBudget] = useState(() => loadState(STORAGE_KEYS.businessBudget, initialBusinessData));
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "Checking", balance: 0 });
  const [overviewRange, setOverviewRange] = useState("ytd");
  const [overviewMonth, setOverviewMonth] = useState("March");
  const [editingMonth, setEditingMonth] = useState(null);

  // ── Persist to localStorage on change ────────────────────
  useEffect(() => { saveState(STORAGE_KEYS.accounts, accounts); }, [accounts]);
  useEffect(() => { saveState(STORAGE_KEYS.budget, budget); }, [budget]);
  useEffect(() => { saveState(STORAGE_KEYS.businessBudget, businessBudget); }, [businessBudget]);

  // ── Derived Data ─────────────────────────────────────────
  const totalDebt = useMemo(() =>
    accounts.filter(a => a.type === "Credit Card").reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalCash = useMemo(() =>
    accounts.filter(a => ["Checking", "Savings"].includes(a.type)).reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalChecking = useMemo(() =>
    accounts.filter(a => a.type === "Checking").reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalInvestments = useMemo(() =>
    accounts.filter(a => ["Investment", "Retirement"].includes(a.type)).reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalAssets = useMemo(() =>
    accounts.filter(a => a.type === "Asset").reduce((s, a) => s + a.balance, 0), [accounts]);
  const netWorth = useMemo(() => {
    const nw = netWorthItems.reduce((s, i) => s + i.value, 0);
    return nw;
  }, []);

  const totalIncomeAll = useMemo(() => budget.reduce((s, b) => s + b.totalIncome, 0), [budget]);
  const totalExpenseAll = useMemo(() => budget.reduce((s, b) => s + b.totalExpense, 0), [budget]);
  const latestBalance = budget.length > 0 ? budget[budget.length - 1].balance : 0;

  const expenseBreakdown = useMemo(() => {
    const cats = { Mortgage: 0, Utilities: 0, Housekeeping: 0, "Pre-school": 0, Cash: 0, "Chase Payment": 0, "Robinhood/Fidelity": 0 };
    budget.forEach(b => {
      cats.Mortgage += b.mortgage;
      cats.Utilities += b.water;
      cats.Housekeeping += b.housekeeping;
      cats["Pre-school"] += b.preschool;
      cats.Cash += b.cash;
      cats["Chase Payment"] += b.chase;
      cats["Robinhood/Fidelity"] += b.robinhood;
    });
    return Object.entries(cats).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [budget]);

  const netWorthPie = useMemo(() =>
    netWorthItems.filter(i => i.value > 0).map(i => ({ ...i })), []);

  const MONTH_MAP = { Jan:"January", Feb:"February", Mar:"March", Apr:"April", May:"May", Jun:"June", Jul:"July", Aug:"August", Sep:"September", Oct:"October", Nov:"November", Dec:"December" };
  const MONTH_ORDER = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const CURRENT_MONTH_IDX = 2; // March 2026
  const monthlyBudget = useMemo(() => {
    const groups = [];
    const seen = {};
    budget.forEach(row => {
      const abbr = row.period.split(" ")[0];
      const name = MONTH_MAP[abbr] || abbr;
      if (!seen[name]) { seen[name] = true; groups.push({ name, rows: [] }); }
      groups[groups.length - 1].rows.push(row);
    });
    return groups.map(({ name, rows }) => {
      const carryover   = rows[0].carryover;
      const income      = rows.reduce((s, r) => s + r.income, 0);
      const misc        = rows.reduce((s, r) => s + r.misc, 0);
      const mortgage    = rows.reduce((s, r) => s + r.mortgage, 0);
      const water       = rows.reduce((s, r) => s + r.water, 0);
      const housekeeping = rows.reduce((s, r) => s + r.housekeeping, 0);
      const preschool   = rows.reduce((s, r) => s + r.preschool, 0);
      const cash        = rows.reduce((s, r) => s + r.cash, 0);
      const chase       = rows.reduce((s, r) => s + r.chase, 0);
      const robinhood   = rows.reduce((s, r) => s + r.robinhood, 0);
      const totalIncome  = carryover + income + misc;
      const totalExpense = mortgage + water + housekeeping + preschool + cash + chase + robinhood;
      return { period: name, carryover, income, misc, totalIncome, mortgage, water, housekeeping, preschool, cash, chase, robinhood, totalExpense, balance: totalIncome - totalExpense };
    });
  }, [budget]);

  const overviewData = useMemo(() => {
    if (overviewRange === "ytd") return monthlyBudget.filter((_, i) => i <= CURRENT_MONTH_IDX);
    if (overviewRange === "month") return monthlyBudget.filter(r => r.period === overviewMonth);
    return monthlyBudget;
  }, [overviewRange, overviewMonth, monthlyBudget]);
  const overviewIncome = useMemo(() => overviewData.reduce((s, r) => s + r.income + r.misc, 0), [overviewData]);
  const overviewExpenses = useMemo(() => overviewData.reduce((s, r) => s + r.totalExpense, 0), [overviewData]);

  const monthlyBusinessBudget = useMemo(() => {
    const groups = [];
    const seen = {};
    businessBudget.forEach(row => {
      const abbr = row.period.split(" ")[0];
      const name = MONTH_MAP[abbr] || abbr;
      if (!seen[name]) { seen[name] = true; groups.push({ name, rows: [] }); }
      groups[groups.length - 1].rows.push(row);
    });
    return groups.map(({ name, rows }) => {
      const carryover       = rows[0].carryover;
      const consulting      = rows.reduce((s, r) => s + r.consulting, 0);
      const sunderMed       = rows.reduce((s, r) => s + r.sunderMed, 0);
      const miscTransfer    = rows.reduce((s, r) => s + r.miscTransfer, 0);
      const salary          = rows.reduce((s, r) => s + r.salary, 0);
      const tax             = rows.reduce((s, r) => s + r.tax, 0);
      const healthInsurance = rows.reduce((s, r) => s + r.healthInsurance, 0);
      const autoLoan        = rows.reduce((s, r) => s + r.autoLoan, 0);
      const autoInsurance   = rows.reduce((s, r) => s + r.autoInsurance, 0);
      const utilities       = rows.reduce((s, r) => s + r.utilities, 0);
      const chase           = rows.reduce((s, r) => s + r.chase, 0);
      const misc            = rows.reduce((s, r) => s + r.misc, 0);
      const capitalOne      = rows.reduce((s, r) => s + r.capitalOne, 0);
      const totalIncome     = carryover + consulting + sunderMed + miscTransfer;
      const totalExpense    = salary + tax + healthInsurance + autoLoan + autoInsurance + utilities + chase + misc + capitalOne;
      return { period: name, carryover, consulting, sunderMed, miscTransfer, totalIncome,
               salary, tax, healthInsurance, autoLoan, autoInsurance, utilities, chase, misc, capitalOne,
               totalExpense, balance: totalIncome - totalExpense };
    });
  }, [businessBudget]);

  // ── Handlers ─────────────────────────────────────────────
  const updateAccount = useCallback((id, newBalance) => {
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, balance: newBalance, lastUpdated: new Date().toISOString().split("T")[0] } : a
    ));
  }, []);

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
      p.totalIncome = p.carryover + p.income + p.misc;
      p.totalExpense = p.mortgage + p.water + p.housekeeping + p.preschool + p.cash + p.chase + p.robinhood;
      p.balance = p.totalIncome - p.totalExpense;
      return updated;
    });
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(180deg, ${COLORS.bg} 0%, #0d1f38 50%, ${COLORS.bg} 100%)`,
      color: COLORS.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "24px 28px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#f5f3ff" }}>Budget Manager</h1>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: COLORS.textDim }}>Personal finance dashboard — 2026</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["overview", "Overview"],
            ["budget", "Budget"],
            ["business", "Business"],
            ["balances", "Balances"],
            ["networth", "Net Worth"],
          ].map(([key, label]) => (
            <TabBtn key={key} active={tab === key} onClick={() => setTab(key)}>{label}</TabBtn>
          ))}
        </div>
      </div>

      {/* ════ OVERVIEW TAB ════ */}
      {tab === "overview" && (
        <>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
            {[["ytd","YTD"],["month","Monthly"],["forecast","Full Year"]].map(([r,label]) => (
              <button key={r} onClick={() => setOverviewRange(r)} style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: overviewRange === r ? COLORS.accent : "#0f2035",
                color: overviewRange === r ? "#fff" : COLORS.textMuted,
              }}>{label}</button>
            ))}
            {overviewRange === "month" && (
              <select value={overviewMonth} onChange={e => setOverviewMonth(e.target.value)} style={{
                padding: "7px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                background: "#091525", color: COLORS.text, fontSize: 13, cursor: "pointer",
              }}>
                {MONTH_ORDER.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Income" value={fmtFull(overviewIncome)}
              subtitle={overviewRange === "ytd" ? "Jan – Mar 2026" : overviewRange === "month" ? overviewMonth : "Full Year 2026"}
              color={COLORS.green} />
            <KPI title="Expenses" value={fmtFull(overviewExpenses)}
              subtitle={overviewRange === "ytd" ? "Jan – Mar 2026" : overviewRange === "month" ? overviewMonth : "Full Year 2026"}
              color={COLORS.pink} />
            <KPI title="Checking Balance" value={fmtFull(totalChecking)} subtitle="Sum of checking accounts" color={COLORS.accent} />
            <KPI title="Credit Card Balance" value={fmtFull(totalDebt)} negative={totalDebt > 0} color={COLORS.red} />
          </div>

          <div style={{ display: "flex", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
            <Card style={{ flex: "2 1 450px" }}>
              <CardTitle>Income vs Expenses by Month</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={overviewData}>
                  <defs>
                    <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.green} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.pink} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.pink} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="period" tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={{ stroke: "#1e3a5f" }} />
                  <YAxis tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={{ stroke: "#1e3a5f" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="totalIncome" stroke={COLORS.green} strokeWidth={2.5} fill="url(#incG)" name="Income" />
                  <Area type="monotone" dataKey="totalExpense" stroke={COLORS.pink} strokeWidth={2.5} fill="url(#expG)" name="Expenses" />
                  <Legend wrapperStyle={{ color: COLORS.textMuted, fontSize: 12, paddingTop: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ flex: "1 1 280px" }}>
              <CardTitle>Expense Breakdown (YTD)</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                    {expenseBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#0f2035", border: `1px solid ${COLORS.accent}`, borderRadius: 8, color: COLORS.text }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", justifyContent: "center" }}>
                {expenseBreakdown.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.textMuted }}>
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
              <LineChart data={budget}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="period" tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={{ stroke: "#1e3a5f" }} />
                <YAxis tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={{ stroke: "#1e3a5f" }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="balance" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.accent, stroke: "#0f2035", strokeWidth: 2 }} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {/* ════ BUDGET TAB ════ */}
      {tab === "budget" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <CardTitle>Personal Budget — 2026 (Monthly)</CardTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  {["Period", "Carryover", "Income", "Misc", "Total In", "Mortgage", "Water", "Housekeep", "Pre-school", "Cash", "Chase", "Robinhood", "Total Exp", "Balance", ""].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Period" || h === "" ? "left" : "right", padding: "10px 8px",
                      color: COLORS.textDim, fontWeight: 600, fontSize: 11, whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: 0.3,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBudget.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}22`,
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "10px 8px", color: COLORS.textMuted, fontWeight: 600 }}>{row.period}</td>
                    {[row.carryover, row.income, row.misc, row.totalIncome, row.mortgage, row.water, row.housekeeping, row.preschool, row.cash, row.chase, row.robinhood, row.totalExpense, row.balance].map((val, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "10px 8px",
                        color: j === 3 ? COLORS.green : j === 11 ? COLORS.pink : j === 12 ? (val < 0 ? COLORS.red : COLORS.green) : COLORS.text,
                        fontWeight: [3, 11, 12].includes(j) ? 700 : 400,
                        fontFamily: "monospace", fontSize: 13,
                      }}>
                        {val === 0 ? "—" : fmtFull(val)}
                      </td>
                    ))}
                    <td style={{ padding: "10px 8px" }}>
                      <button onClick={() => setEditingMonth(row.period)} style={{
                        padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                        background: COLORS.accent, color: "#fff", fontSize: 11, fontWeight: 600,
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${COLORS.accent}` }}>
                  <td style={{ padding: "12px 8px", fontWeight: 700, color: COLORS.textMuted }}>TOTALS</td>
                  {(() => {
                    const sums = monthlyBudget.reduce((acc, r) => ({
                      carryover: acc.carryover + r.carryover, income: acc.income + r.income, misc: acc.misc + r.misc,
                      totalIncome: acc.totalIncome + r.totalIncome, mortgage: acc.mortgage + r.mortgage,
                      water: acc.water + r.water, housekeeping: acc.housekeeping + r.housekeeping,
                      preschool: acc.preschool + r.preschool, cash: acc.cash + r.cash, chase: acc.chase + r.chase,
                      robinhood: acc.robinhood + r.robinhood, totalExpense: acc.totalExpense + r.totalExpense,
                      balance: acc.balance + r.balance,
                    }), { carryover: 0, income: 0, misc: 0, totalIncome: 0, mortgage: 0, water: 0, housekeeping: 0, preschool: 0, cash: 0, chase: 0, robinhood: 0, totalExpense: 0, balance: 0 });
                    return [sums.carryover, sums.income, sums.misc, sums.totalIncome, sums.mortgage, sums.water, sums.housekeeping, sums.preschool, sums.cash, sums.chase, sums.robinhood, sums.totalExpense, sums.balance].map((v, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "12px 8px", fontWeight: 700,
                        color: j === 3 ? COLORS.green : j === 11 ? COLORS.pink : COLORS.text,
                        fontFamily: "monospace", fontSize: 13,
                      }}>{fmtFull(v)}</td>
                    ));
                  })()}
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ════ BUSINESS TAB ════ */}
      {tab === "business" && (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <CardTitle>Business Budget — 2026 (Monthly)</CardTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1100 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  {["Period","Carryover","Consulting","SunderMed","Misc","Total In","Salary","Tax","Health","Auto Loan","Auto Ins","Utilities","Chase","Misc","Cap One","Total Exp","Balance"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Period" ? "left" : "right", padding: "10px 8px",
                      color: COLORS.textDim, fontWeight: 600, fontSize: 11, whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: 0.3,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBusinessBudget.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}22`, transition: "background 0.15s" }}>
                    <td style={{ padding: "10px 8px", color: COLORS.textMuted, fontWeight: 600 }}>{row.period}</td>
                    {[row.carryover, row.consulting, row.sunderMed, row.miscTransfer, row.totalIncome,
                      row.salary, row.tax, row.healthInsurance, row.autoLoan, row.autoInsurance,
                      row.utilities, row.chase, row.misc, row.capitalOne, row.totalExpense, row.balance].map((val, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "10px 8px",
                        color: j === 4 ? COLORS.green : j === 14 ? COLORS.pink : j === 15 ? (val < 0 ? COLORS.red : COLORS.green) : COLORS.text,
                        fontWeight: [4, 14, 15].includes(j) ? 700 : 400,
                        fontFamily: "monospace", fontSize: 13,
                      }}>
                        {val === 0 ? "—" : fmtFull(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${COLORS.accent}` }}>
                  <td style={{ padding: "12px 8px", fontWeight: 700, color: COLORS.textMuted }}>TOTALS</td>
                  {(() => {
                    const s = monthlyBusinessBudget.reduce((acc, r) => ({
                      carryover: acc.carryover + r.carryover, consulting: acc.consulting + r.consulting,
                      sunderMed: acc.sunderMed + r.sunderMed, miscTransfer: acc.miscTransfer + r.miscTransfer,
                      totalIncome: acc.totalIncome + r.totalIncome, salary: acc.salary + r.salary,
                      tax: acc.tax + r.tax, healthInsurance: acc.healthInsurance + r.healthInsurance,
                      autoLoan: acc.autoLoan + r.autoLoan, autoInsurance: acc.autoInsurance + r.autoInsurance,
                      utilities: acc.utilities + r.utilities, chase: acc.chase + r.chase,
                      misc: acc.misc + r.misc, capitalOne: acc.capitalOne + r.capitalOne,
                      totalExpense: acc.totalExpense + r.totalExpense, balance: acc.balance + r.balance,
                    }), { carryover:0, consulting:0, sunderMed:0, miscTransfer:0, totalIncome:0, salary:0, tax:0, healthInsurance:0, autoLoan:0, autoInsurance:0, utilities:0, chase:0, misc:0, capitalOne:0, totalExpense:0, balance:0 });
                    return [s.carryover, s.consulting, s.sunderMed, s.miscTransfer, s.totalIncome,
                            s.salary, s.tax, s.healthInsurance, s.autoLoan, s.autoInsurance,
                            s.utilities, s.chase, s.misc, s.capitalOne, s.totalExpense, s.balance].map((v, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "12px 8px", fontWeight: 700,
                        color: j === 4 ? COLORS.green : j === 14 ? COLORS.pink : COLORS.text,
                        fontFamily: "monospace", fontSize: 13,
                      }}>{fmtFull(v)}</td>
                    ));
                  })()}
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ════ BALANCES TAB ════ */}
      {tab === "balances" && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Cash & Checking" value={fmtFull(totalCash)} color={COLORS.green} />
            <KPI title="Investments & Retirement" value={fmtFull(totalInvestments)} color={COLORS.accent2} />
            <KPI title="Real Estate & Assets" value={fmtFull(totalAssets)} color={COLORS.accent} />
            <KPI title="Credit Card Debt" value={fmtFull(totalDebt)} negative={totalDebt > 0} color={COLORS.red} />
          </div>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <CardTitle>Account Balances</CardTitle>
              <Btn onClick={() => setAddingAccount(true)} variant="primary">+ Add Account</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                  {["Account", "Type", "Balance", "Last Updated", "Actions"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Balance" ? "right" : "left", padding: "10px 12px",
                      color: COLORS.textDim, fontWeight: 600, fontSize: 12, textTransform: "uppercase"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                    <td style={{ padding: "12px", color: COLORS.text, fontWeight: 500 }}>{a.name}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: a.type === "Credit Card" ? "rgba(248,113,113,0.15)" : a.type === "Checking" ? "rgba(52,211,153,0.15)" : "rgba(37,99,235,0.15)",
                        color: a.type === "Credit Card" ? COLORS.red : a.type === "Checking" ? COLORS.green : COLORS.accent2,
                      }}>{a.type}</span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, fontSize: 15, color: a.type === "Credit Card" && a.balance > 0 ? COLORS.red : COLORS.text }}>
                      {fmtFull(a.balance)}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.textDim, fontSize: 13 }}>{a.lastUpdated}</td>
                    <td style={{ padding: "12px", display: "flex", gap: 8 }}>
                      <button onClick={() => setEditingAccount(a)} style={{
                        padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                        background: COLORS.accent, color: "#fff", fontSize: 12, fontWeight: 600
                      }}>Update</button>
                      <button onClick={() => removeAccount(a.id)} style={{
                        padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                        background: "#2d1515", color: COLORS.red, fontSize: 12, fontWeight: 600
                      }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ════ NET WORTH TAB ════ */}
      {tab === "networth" && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <KPI title="Total Net Worth" value={fmtFull(netWorth)} color={COLORS.accent2} />
            <KPI title="Liquid Assets" value={fmtFull(240000)} subtitle="Savings" color={COLORS.green} />
            <KPI title="Real Estate" value={fmtFull(2000000)} subtitle="Home value" color={COLORS.accent} />
            <KPI title="Retirement" value={fmtFull(390000)} subtitle="All retirement accounts" color={COLORS.accent3} />
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Card style={{ flex: "1 1 350px" }}>
              <CardTitle>Net Worth Composition</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={netWorthPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2} strokeWidth={0}>
                    {netWorthPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#0f2035", border: `1px solid ${COLORS.accent}`, borderRadius: 8, color: COLORS.text }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", justifyContent: "center" }}>
                {netWorthPie.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textMuted }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis type="number" tickFormatter={fmt} tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={{ stroke: "#1e3a5f" }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={{ stroke: "#1e3a5f" }} width={120} />
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#0f2035", border: `1px solid ${COLORS.accent}`, borderRadius: 8, color: COLORS.text }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
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
        <Modal title={`Update ${editingAccount.name}`} onClose={() => setEditingAccount(null)}>
          <Input label="New Balance" value={editingAccount.balance} onChange={v => setEditingAccount({ ...editingAccount, balance: v })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setEditingAccount(null)}>Cancel</Btn>
            <Btn onClick={() => { updateAccount(editingAccount.id, editingAccount.balance); setEditingAccount(null); }}>Save</Btn>
          </div>
        </Modal>
      )}

      {editingPeriod !== null && (
        <Modal title={`Edit Period: ${budget[editingPeriod].period}`} onClose={() => setEditingPeriod(null)}>
          <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 12, textTransform: "uppercase", fontWeight: 600 }}>Income</div>
          <Input label="Carryover" value={budget[editingPeriod].carryover} onChange={v => updatePeriod(editingPeriod, "carryover", v)} />
          <Input label="Income" value={budget[editingPeriod].income} onChange={v => updatePeriod(editingPeriod, "income", v)} />
          <Input label="Misc Transfer" value={budget[editingPeriod].misc} onChange={v => updatePeriod(editingPeriod, "misc", v)} />
          <div style={{ fontSize: 12, color: COLORS.textDim, margin: "16px 0 12px", textTransform: "uppercase", fontWeight: 600 }}>Expenses</div>
          <Input label="Mortgage" value={budget[editingPeriod].mortgage} onChange={v => updatePeriod(editingPeriod, "mortgage", v)} />
          <Input label="Water & Power" value={budget[editingPeriod].water} onChange={v => updatePeriod(editingPeriod, "water", v)} />
          <Input label="Housekeeping" value={budget[editingPeriod].housekeeping} onChange={v => updatePeriod(editingPeriod, "housekeeping", v)} />
          <Input label="Pre-school" value={budget[editingPeriod].preschool} onChange={v => updatePeriod(editingPeriod, "preschool", v)} />
          <Input label="Cash Expense" value={budget[editingPeriod].cash} onChange={v => updatePeriod(editingPeriod, "cash", v)} />
          <Input label="Chase Payment" value={budget[editingPeriod].chase} onChange={v => updatePeriod(editingPeriod, "chase", v)} />
          <Input label="Robinhood / Fidelity" value={budget[editingPeriod].robinhood} onChange={v => updatePeriod(editingPeriod, "robinhood", v)} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <Btn onClick={() => setEditingPeriod(null)}>Done</Btn>
          </div>
        </Modal>
      )}

      {editingMonth && (() => {
        const periods = budget
          .map((row, idx) => ({ row, idx }))
          .filter(({ row }) => {
            const abbr = row.period.split(" ")[0];
            return MONTH_MAP[abbr] === editingMonth;
          });
        return (
          <Modal title={`Edit ${editingMonth}`} onClose={() => setEditingMonth(null)}>
            {periods.map(({ row, idx }, pi) => (
              <div key={idx}>
                {pi > 0 && <hr style={{ border: "none", borderTop: `1px solid ${COLORS.border}`, margin: "16px 0" }} />}
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, marginBottom: 12 }}>
                  Period: {row.period}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>Income</div>
                <Input label="Carryover" value={row.carryover} onChange={v => updatePeriod(idx, "carryover", v)} />
                <Input label="Income" value={row.income} onChange={v => updatePeriod(idx, "income", v)} />
                <Input label="Misc Transfer" value={row.misc} onChange={v => updatePeriod(idx, "misc", v)} />
                <div style={{ fontSize: 12, color: COLORS.textDim, margin: "12px 0 8px", textTransform: "uppercase", fontWeight: 600 }}>Expenses</div>
                <Input label="Mortgage" value={row.mortgage} onChange={v => updatePeriod(idx, "mortgage", v)} />
                <Input label="Water & Power" value={row.water} onChange={v => updatePeriod(idx, "water", v)} />
                <Input label="Housekeeping" value={row.housekeeping} onChange={v => updatePeriod(idx, "housekeeping", v)} />
                <Input label="Pre-school" value={row.preschool} onChange={v => updatePeriod(idx, "preschool", v)} />
                <Input label="Cash Expense" value={row.cash} onChange={v => updatePeriod(idx, "cash", v)} />
                <Input label="Chase Payment" value={row.chase} onChange={v => updatePeriod(idx, "chase", v)} />
                <Input label="Robinhood / Fidelity" value={row.robinhood} onChange={v => updatePeriod(idx, "robinhood", v)} />
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Btn onClick={() => setEditingMonth(null)}>Done</Btn>
            </div>
          </Modal>
        );
      })()}

      {addingAccount && (
        <Modal title="Add New Account" onClose={() => setAddingAccount(false)}>
          <Input label="Account Name" value={newAccount.name} type="text" onChange={v => setNewAccount(p => ({ ...p, name: v }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Type</label>
            <select
              value={newAccount.type}
              onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                background: "#091525", color: COLORS.text, fontSize: 14,
              }}
            >
              {["Checking", "Savings", "Credit Card", "Investment", "Retirement", "Asset"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input label="Balance" value={newAccount.balance} onChange={v => setNewAccount(p => ({ ...p, balance: v }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setAddingAccount(false)}>Cancel</Btn>
            <Btn onClick={addAccount}>Add Account</Btn>
          </div>
        </Modal>
      )}

      <div style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "#1e3a5f" }}>
        Budget Manager • Built from your Budget.xlsx data
      </div>
    </div>
  );
}
