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
  bg:         "#F4F1EC",
  bg2:        "#EDE9E1",
  card:       "#EDE9E1",
  cardAlt:    "#E8E3DB",
  border:     "rgba(44,40,32,0.12)",
  borderStr:  "rgba(44,40,32,0.20)",
  text:       "#2C2820",
  textDim:    "#5A544C",
  textMuted:  "#A09890",
  textHint:   "#C4BDB5",
  accent:     "#B5871A",
  accentS:    "rgba(181,135,26,0.10)",
  accentB:    "rgba(181,135,26,0.22)",
  green:      "#4A7C6F",
  greenS:     "rgba(74,124,111,0.12)",
  red:        "#A63D3D",
  redS:       "rgba(166,61,61,0.10)",
  navBg:      "#2C2820",
  navText:    "#F4F1EC",
  navMuted:   "rgba(244,241,236,0.50)",
};
const PIE_COLORS = ["#4A7C6F","#7B9BA8","#B5871A","#7B6FAA","#8A8278","#A63D3D","#6B8F71"];

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#EDE9E1",
    borderRadius: 10,
    border: "0.5px solid rgba(44,40,32,0.12)",
    padding: 20,
    ...style
  }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 style={{
    margin: "0 0 16px",
    fontSize: 12,
    color: "#2C2820",
    fontWeight: 500,
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "0.02em",
  }}>{children}</h3>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#F4F1EC", border: "0.5px solid rgba(44,40,32,0.15)", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, color: "#2C2820",
      fontFamily: "'Jost', sans-serif",
    }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "#A09890" }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tab Button ───────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #B5871A" : "2px solid transparent",
    color: active ? "#B5871A" : "rgba(244,241,236,0.50)",
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 400,
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "0.03em",
    cursor: "pointer",
    transition: "all 0.15s",
  }}>{children}</button>
);

// ── KPI Card ─────────────────────────────────────────────────
const KPI = ({ title, value, subtitle, color, negative = false }) => (
  <div style={{
    background: "#EDE9E1",
    border: "0.5px solid rgba(44,40,32,0.12)",
    borderRadius: 10,
    padding: "14px 16px",
    flex: 1,
  }}>
    <div style={{
      fontSize: 9,
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#A09890",
      marginBottom: 6,
      fontFamily: "'Jost', sans-serif",
    }}>{title}</div>
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontWeight: 400,
      fontSize: 22,
      color: color || (negative ? "#A63D3D" : "#2C2820"),
      lineHeight: 1,
      marginBottom: 5,
    }}>{value}</div>
    {subtitle && (
      <div style={{
        fontSize: 10,
        fontWeight: 300,
        color: "#A09890",
        fontFamily: "'Jost', sans-serif",
      }}>{subtitle}</div>
    )}
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(44,40,32,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000
  }} onClick={onClose}>
    <div style={{
      background: "#F4F1EC", borderRadius: 12, border: "0.5px solid rgba(44,40,32,0.15)",
      padding: 28, minWidth: 380, maxWidth: 520, width: "90%", maxHeight: "80vh", overflowY: "auto"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 18, color: "#2C2820" }}>{title}</h2>
        <button onClick={onClose} style={{
          background: "none", border: "none", fontSize: 18, color: "#A09890", cursor: "pointer"
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, value, onChange, type = "number" }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{
      display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#A09890", marginBottom: 5,
      fontFamily: "'Jost', sans-serif",
    }}>{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
      style={{
        width: "100%", padding: "8px 10px", background: "#F4F1EC",
        border: "0.5px solid rgba(44,40,32,0.20)", borderRadius: 6,
        fontSize: 13, color: "#2C2820", fontFamily: "'Jost', sans-serif",
        outline: "none", boxSizing: "border-box",
      }}
    />
  </div>
);

const Btn = ({ onClick, children, variant = "primary", style = {} }) => (
  <button onClick={onClick} style={{
    background: variant === "primary" ? "#2C2820" : "rgba(44,40,32,0.08)",
    color: variant === "primary" ? "#F4F1EC" : "#5A544C",
    border: variant === "primary" ? "none" : "0.5px solid rgba(44,40,32,0.15)",
    borderRadius: 5,
    padding: "5px 12px",
    fontSize: 11,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 400,
    cursor: "pointer",
    ...style,
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
  const updateAccount = useCallback((updated) => {
    setAccounts(prev => prev.map(a =>
      a.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString().split("T")[0] } : a
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
      minHeight: "100vh", background: "#F4F1EC",
      color: "#2C2820", fontFamily: "'Jost', sans-serif",
    }}>
      {/* Header */}
      <div style={{ background: "#2C2820", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: 20, color: "#F4F1EC", margin: 0 }}>Budget Manager</h1>
          <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 300, color: "rgba(244,241,236,0.50)", letterSpacing: "0.04em" }}>Personal finance dashboard — 2026</p>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
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
      <div style={{ padding: "24px 28px" }}>

      {/* ════ OVERVIEW TAB ════ */}
      {tab === "overview" && (
        <>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(44,40,32,0.07)", borderRadius: 8, padding: 3, display: "inline-flex", gap: 3 }}>
              {[["ytd","YTD"],["month","Monthly"],["forecast","Full Year"]].map(([r,label]) => (
                <button key={r} onClick={() => setOverviewRange(r)} style={{
                  padding: "5px 14px", fontSize: 11, fontFamily: "'Jost', sans-serif",
                  borderRadius: 5, border: "none", cursor: "pointer",
                  background: overviewRange === r ? "#2C2820" : "transparent",
                  color: overviewRange === r ? "#F4F1EC" : "#A09890",
                }}>{label}</button>
              ))}
            </div>
            {overviewRange === "month" && (
              <select value={overviewMonth} onChange={e => setOverviewMonth(e.target.value)} style={{
                padding: "5px 10px", borderRadius: 6, border: "0.5px solid rgba(44,40,32,0.20)",
                background: "#F4F1EC", color: "#2C2820", fontSize: 11,
                fontFamily: "'Jost', sans-serif", cursor: "pointer",
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
              color={COLORS.red} />
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
                      <stop offset="0%" stopColor="#4A7C6F" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#4A7C6F" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A63D3D" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#A63D3D" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,40,32,0.08)" />
                  <XAxis dataKey="period" tick={{ fill: "#A09890", fontSize: 10 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} />
                  <YAxis tickFormatter={fmt} tick={{ fill: "#A09890", fontSize: 10 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="totalIncome" stroke="#4A7C6F" strokeWidth={2} fill="url(#incG)" name="Income" />
                  <Area type="monotone" dataKey="totalExpense" stroke="#A63D3D" strokeWidth={2} fill="url(#expG)" name="Expenses" />
                  <Legend wrapperStyle={{ color: "#A09890", fontSize: 11, paddingTop: 8 }} />
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
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#F4F1EC", border: "0.5px solid rgba(44,40,32,0.15)", borderRadius: 8, color: "#2C2820" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", justifyContent: "center" }}>
                {expenseBreakdown.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#A09890" }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,40,32,0.08)" />
                <XAxis dataKey="period" tick={{ fill: "#A09890", fontSize: 10 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} />
                <YAxis tickFormatter={fmt} tick={{ fill: "#A09890", fontSize: 10 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="balance" stroke="#B5871A" strokeWidth={2} dot={{ r: 4, fill: "#B5871A", stroke: "#F4F1EC", strokeWidth: 2 }} name="Balance" />
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 900 }}>
              <thead>
                <tr>
                  {["Period", "Carryover", "Income", "Misc", "Total In", "Mortgage", "Water", "Housekeep", "Pre-school", "Cash", "Chase", "Robinhood", "Total Exp", "Balance", ""].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Period" || h === "" ? "left" : "right",
                      padding: "8px 12px", background: "#E4DFDA",
                      color: "#A09890", fontWeight: 500, fontSize: 9, whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.10em",
                      fontFamily: "'Jost', sans-serif",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBudget.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 1 ? "rgba(44,40,32,0.025)" : "transparent" }}>
                    <td style={{ padding: "9px 12px", color: "#2C2820", fontWeight: 500, borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>{row.period}</td>
                    {[row.carryover, row.income, row.misc, row.totalIncome, row.mortgage, row.water, row.housekeeping, row.preschool, row.cash, row.chase, row.robinhood, row.totalExpense, row.balance].map((val, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "9px 12px",
                        borderBottom: "0.5px solid rgba(44,40,32,0.07)",
                        color: j === 3 ? "#4A7C6F" : j === 11 ? "#A63D3D" : j === 12 ? (val < 0 ? "#A63D3D" : "#4A7C6F") : "#5A544C",
                        fontWeight: [3, 11, 12].includes(j) ? 500 : 400,
                        fontFamily: "'Jost', sans-serif", fontSize: 11,
                      }}>
                        {val === 0 ? "—" : fmtFull(val)}
                      </td>
                    ))}
                    <td style={{ padding: "9px 12px", borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>
                      <button onClick={() => setEditingMonth(row.period)} style={{
                        padding: "3px 10px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: "rgba(44,40,32,0.08)", color: "#5A544C", fontSize: 10,
                        fontFamily: "'Jost', sans-serif",
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1.5px solid rgba(44,40,32,0.20)" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 500, color: "#2C2820", fontFamily: "'Jost', sans-serif", fontSize: 11 }}>TOTALS</td>
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
                        textAlign: "right", padding: "9px 12px", fontWeight: 500,
                        color: j === 3 ? "#4A7C6F" : j === 11 ? "#A63D3D" : "#2C2820",
                        fontFamily: "'Jost', sans-serif", fontSize: 11,
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 1100 }}>
              <thead>
                <tr>
                  {["Period","Carryover","Consulting","SunderMed","Misc","Total In","Salary","Tax","Health","Auto Loan","Auto Ins","Utilities","Chase","Misc","Cap One","Total Exp","Balance"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Period" ? "left" : "right", padding: "8px 12px",
                      background: "#E4DFDA", color: "#A09890", fontWeight: 500, fontSize: 9, whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBusinessBudget.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 1 ? "rgba(44,40,32,0.025)" : "transparent" }}>
                    <td style={{ padding: "9px 12px", color: "#2C2820", fontWeight: 500, borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>{row.period}</td>
                    {[row.carryover, row.consulting, row.sunderMed, row.miscTransfer, row.totalIncome,
                      row.salary, row.tax, row.healthInsurance, row.autoLoan, row.autoInsurance,
                      row.utilities, row.chase, row.misc, row.capitalOne, row.totalExpense, row.balance].map((val, j) => (
                      <td key={j} style={{
                        textAlign: "right", padding: "9px 12px",
                        borderBottom: "0.5px solid rgba(44,40,32,0.07)",
                        color: j === 4 ? "#4A7C6F" : j === 14 ? "#A63D3D" : j === 15 ? (val < 0 ? "#A63D3D" : "#4A7C6F") : "#5A544C",
                        fontWeight: [4, 14, 15].includes(j) ? 500 : 400,
                        fontFamily: "'Jost', sans-serif", fontSize: 11,
                      }}>
                        {val === 0 ? "—" : fmtFull(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1.5px solid rgba(44,40,32,0.20)" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 500, color: "#2C2820", fontFamily: "'Jost', sans-serif", fontSize: 11 }}>TOTALS</td>
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
                        textAlign: "right", padding: "9px 12px", fontWeight: 500,
                        color: j === 4 ? "#4A7C6F" : j === 14 ? "#A63D3D" : "#2C2820",
                        fontFamily: "'Jost', sans-serif", fontSize: 11,
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
            <KPI title="Investments & Retirement" value={fmtFull(totalInvestments)} color={COLORS.accent} />
            <KPI title="Real Estate & Assets" value={fmtFull(totalAssets)} color={COLORS.accent} />
            <KPI title="Credit Card Debt" value={fmtFull(totalDebt)} negative={totalDebt > 0} />
          </div>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <CardTitle>Account Balances</CardTitle>
              <Btn onClick={() => setAddingAccount(true)} variant="primary">+ Add Account</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>
                  {["Account", "Type", "Balance", "Last Updated", "Actions"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Balance" ? "right" : "left", padding: "8px 12px",
                      background: "#E4DFDA", color: "#A09890", fontWeight: 500, fontSize: 9,
                      textTransform: "uppercase", letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((a, i) => (
                  <tr key={a.id} style={{ background: i % 2 === 1 ? "rgba(44,40,32,0.025)" : "transparent" }}>
                    <td style={{ padding: "9px 12px", color: "#2C2820", fontWeight: 500, borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>{a.name}</td>
                    <td style={{ padding: "9px 12px", borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>
                      <span style={{
                        padding: "2px 9px", borderRadius: 10, fontSize: 10,
                        background: "rgba(44,40,32,0.08)", color: "#5A544C",
                        border: "0.5px solid rgba(44,40,32,0.15)",
                      }}>{a.type}</span>
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "right", fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 13, borderBottom: "0.5px solid rgba(44,40,32,0.07)", color: a.type === "Credit Card" && a.balance > 0 ? "#A63D3D" : "#2C2820" }}>
                      {fmtFull(a.balance)}
                    </td>
                    <td style={{ padding: "9px 12px", color: "#A09890", fontSize: 11, borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>{a.lastUpdated}</td>
                    <td style={{ padding: "9px 12px", display: "flex", gap: 6, borderBottom: "0.5px solid rgba(44,40,32,0.07)" }}>
                      <button onClick={() => setEditingAccount(a)} style={{
                        padding: "3px 10px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: "rgba(44,40,32,0.08)", color: "#5A544C", fontSize: 10,
                        fontFamily: "'Jost', sans-serif",
                      }}>Update</button>
                      <button onClick={() => removeAccount(a.id)} style={{
                        padding: "3px 10px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: "rgba(166,61,61,0.08)", color: "#A63D3D", fontSize: 10,
                        fontFamily: "'Jost', sans-serif",
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
            <KPI title="Total Net Worth" value={fmtFull(netWorth)} color={COLORS.accent} />
            <KPI title="Liquid Assets" value={fmtFull(240000)} subtitle="Savings" color={COLORS.green} />
            <KPI title="Real Estate" value={fmtFull(2000000)} subtitle="Home value" color={COLORS.accent} />
            <KPI title="Retirement" value={fmtFull(390000)} subtitle="All retirement accounts" color={COLORS.green} />
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Card style={{ flex: "1 1 350px" }}>
              <CardTitle>Net Worth Composition</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={netWorthPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2} strokeWidth={0}>
                    {netWorthPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#F4F1EC", border: "0.5px solid rgba(44,40,32,0.15)", borderRadius: 8, color: "#2C2820" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", justifyContent: "center" }}>
                {netWorthPie.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#A09890" }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,40,32,0.08)" />
                  <XAxis type="number" tickFormatter={fmt} tick={{ fill: "#A09890", fontSize: 10 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#A09890", fontSize: 11 }} axisLine={{ stroke: "rgba(44,40,32,0.08)" }} width={120} />
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#F4F1EC", border: "0.5px solid rgba(44,40,32,0.15)", borderRadius: 8, color: "#2C2820" }} />
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
        <Modal title="Edit Account" onClose={() => setEditingAccount(null)}>
          <Input label="Account Name" type="text" value={editingAccount.name} onChange={v => setEditingAccount({ ...editingAccount, name: v })} />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A09890", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Type</label>
            <select
              value={editingAccount.type}
              onChange={e => setEditingAccount({ ...editingAccount, type: e.target.value })}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 6, border: "0.5px solid rgba(44,40,32,0.20)",
                background: "#F4F1EC", color: "#2C2820", fontSize: 13, fontFamily: "'Jost', sans-serif",
              }}
            >
              {["Checking", "Savings", "Credit Card", "Investment", "Retirement", "Asset"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input label="Balance" value={editingAccount.balance} onChange={v => setEditingAccount({ ...editingAccount, balance: v })} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setEditingAccount(null)}>Cancel</Btn>
            <Btn onClick={() => { updateAccount(editingAccount); setEditingAccount(null); }}>Save</Btn>
          </div>
        </Modal>
      )}

      {editingPeriod !== null && (
        <Modal title={`Edit Period: ${budget[editingPeriod].period}`} onClose={() => setEditingPeriod(null)}>
          <div style={{ fontSize: 9, color: "#A09890", marginBottom: 10, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif" }}>Income</div>
          <Input label="Carryover" value={budget[editingPeriod].carryover} onChange={v => updatePeriod(editingPeriod, "carryover", v)} />
          <Input label="Income" value={budget[editingPeriod].income} onChange={v => updatePeriod(editingPeriod, "income", v)} />
          <Input label="Misc Transfer" value={budget[editingPeriod].misc} onChange={v => updatePeriod(editingPeriod, "misc", v)} />
          <div style={{ fontSize: 9, color: "#A09890", margin: "14px 0 10px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif" }}>Expenses</div>
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
                {pi > 0 && <hr style={{ border: "none", borderTop: "0.5px solid rgba(44,40,32,0.15)", margin: "14px 0" }} />}
                <div style={{ fontSize: 12, fontWeight: 400, color: "#B5871A", marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>
                  Period: {row.period}
                </div>
                <div style={{ fontSize: 9, color: "#A09890", marginBottom: 8, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif" }}>Income</div>
                <Input label="Carryover" value={row.carryover} onChange={v => updatePeriod(idx, "carryover", v)} />
                <Input label="Income" value={row.income} onChange={v => updatePeriod(idx, "income", v)} />
                <Input label="Misc Transfer" value={row.misc} onChange={v => updatePeriod(idx, "misc", v)} />
                <div style={{ fontSize: 9, color: "#A09890", margin: "10px 0 8px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.10em", fontFamily: "'Jost', sans-serif" }}>Expenses</div>
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A09890", marginBottom: 5, fontFamily: "'Jost', sans-serif" }}>Type</label>
            <select
              value={newAccount.type}
              onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 6, border: "0.5px solid rgba(44,40,32,0.20)",
                background: "#F4F1EC", color: "#2C2820", fontSize: 13, fontFamily: "'Jost', sans-serif",
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

      <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 11, fontWeight: 300, color: "#A09890", fontFamily: "'Jost', sans-serif" }}>
        Budget Manager • Built from your Budget.xlsx data
      </div>
      </div>
    </div>
  );
}
