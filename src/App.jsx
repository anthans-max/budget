import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const initialBudgetData = [
  { period: "January",   carryover: 4525, income: 15700, misc: 0,    mortgage: 4210, water: 0,   housekeeping: 350, preschool: 1900, cash: 125, chase: 3900, robinhood: 5000 },
  { period: "February",  carryover: 1115, income: 7000,  misc: 0,    mortgage: 4210, water: 0,   housekeeping: 175, preschool: 1900, cash: 125, chase: 2900, robinhood: 8000 },
  { period: "March",     carryover: 1890, income: 10700, misc: 0,    mortgage: 4210, water: 370, housekeeping: 175, preschool: 1900, cash: 125, chase: 1737, robinhood: 0    },
  { period: "April",     carryover: 3000, income: 15826, misc: 2800, mortgage: 8420, water: 820, housekeeping: 350, preschool: 3800, cash: 300, chase: 5100, robinhood: 0    },
  { period: "May",       carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "June",      carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "July",      carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "August",    carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "September", carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "October",   carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "November",  carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
  { period: "December",  carryover: 0,    income: 0,     misc: 0,    mortgage: 0,    water: 0,   housekeeping: 0,   preschool: 0,    cash: 0,   chase: 0,    robinhood: 0    },
].map(r => {
  const totalIncome = r.carryover + r.income + r.misc;
  const totalExpense = r.mortgage + r.water + r.housekeeping + r.preschool + r.cash + r.chase + r.robinhood;
  return { ...r, totalIncome, totalExpense, balance: totalIncome - totalExpense };
});

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

const MONTH_ABBR_MAP = { Jan:"January", Feb:"February", Mar:"March", Apr:"April", May:"May", Jun:"June", Jul:"July", Aug:"August", Sep:"September", Oct:"October", Nov:"November", Dec:"December" };
const initialMonthlyBusinessData = (() => {
  const groups = [];
  const seen = {};
  initialBusinessData.forEach(row => {
    const abbr = row.period.split(" ")[0];
    const name = MONTH_ABBR_MAP[abbr] || abbr;
    if (!seen[name]) { seen[name] = true; groups.push({ name, rows: [] }); }
    groups[groups.length - 1].rows.push(row);
  });
  return groups.map(({ name, rows }) => {
    const result = { period: name, carryover: rows[0].carryover };
    ["consulting","sunderMed","miscTransfer","salary","tax","healthInsurance","autoLoan","autoInsurance","utilities","chase","misc","capitalOne"]
      .forEach(f => { result[f] = rows.reduce((s, r) => s + (r[f] || 0), 0); });
    return result;
  });
})();

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
  bg:          "#faf7f2",
  card:        "#f5f1e8",
  border:      "#e0d8ca",
  borderDark:  "#c8bba5",
  text:        "#3d2e1e",
  textDim:     "#7a6045",
  textMuted:   "#a89070",
  accent:      "#b5703a",
  accentLight: "#d4944e",
  accentPale:  "#faf0e6",
  green:       "#2d4a35",
  greenMid:    "#3d6348",
  greenLight:  "#5a8a68",
  greenPale:   "#eaf2ec",
  red:         "#A63D3D",
  redPale:     "rgba(166,61,61,0.09)",
  slate:       "#3a4a5a",
  slatePale:   "#eaf0f4",
  tan:         "#d4c9b0",
  footerBg:    "#1a1a18",
};
const PIE_COLORS = ["#2d4a35","#b5703a","#3a4a5a","#7a6045","#5a8a68","#A63D3D","#d4944e"];

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#f5f1e8",
    border: "1px solid #e0d8ca",
    borderRadius: 10,
    padding: "22px 24px",
    marginBottom: 20,
    ...style
  }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 style={{
    margin: "0 0 18px",
    fontSize: "0.65rem",
    color: "#a89070",
    fontWeight: 500,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  }}>{children}</h3>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#faf7f2", border: "1px solid #e0d8ca", borderRadius: 8,
      padding: "10px 14px", fontSize: 11, color: "#3d2e1e",
      fontFamily: "'Jost', sans-serif",
    }}>
      <div style={{ fontWeight: 500, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ color: "#a89070" }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{fmtFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tab Button ───────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    background: active ? "#2d4a35" : "transparent",
    border: active ? "none" : "none",
    borderRadius: 100,
    color: active ? "#faf7f2" : "#a89070",
    padding: "7px 18px",
    fontSize: "0.62rem",
    fontWeight: 500,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s",
  }}>{children}</button>
);

// ── KPI Card ─────────────────────────────────────────────────
const KPI = ({ title, value, subtitle, color, negative = false }) => (
  <div style={{
    background: "#f5f1e8",
    border: "1px solid #e0d8ca",
    borderLeft: "3px solid #b5703a",
    borderRadius: "0 10px 10px 0",
    padding: "16px 20px",
    flex: 1,
    minWidth: 160,
  }}>
    <div style={{
      fontSize: "0.6rem",
      fontWeight: 500,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#a89070",
      marginBottom: 8,
      fontFamily: "'Syne', sans-serif",
    }}>{title}</div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 600,
      fontSize: "1.6rem",
      color: color || (negative ? "#A63D3D" : "#3d2e1e"),
      lineHeight: 1,
      marginBottom: 5,
    }}>{value}</div>
    {subtitle && (
      <div style={{
        fontSize: "0.68rem",
        fontWeight: 300,
        color: "#a89070",
        fontFamily: "'Jost', sans-serif",
      }}>{subtitle}</div>
    )}
  </div>
);

// ── Edit Modal ───────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(61,46,30,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000
  }} onClick={onClose}>
    <div style={{
      background: "#faf7f2", borderRadius: 12, border: "1px solid #e0d8ca",
      padding: 28, minWidth: 380, maxWidth: 520, width: "90%", maxHeight: "80vh", overflowY: "auto"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "1.3rem", color: "#3d2e1e" }}>{title}</h2>
        <button onClick={onClose} style={{
          background: "none", border: "none", fontSize: 18, color: "#a89070", cursor: "pointer"
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ label, value, onChange, type = "number" }) => {
  const [display, setDisplay] = useState(() => type === "number" ? String(value ?? 0) : value);
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setDisplay(type === "number" ? String(value ?? 0) : value);
  }, [value, type]);
  if (type !== "number") {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "9px 12px", background: "#f5f1e8", border: "1px solid #c8bba5", borderRadius: 6, fontSize: 13, color: "#3d2e1e", fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box" }} />
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onFocus={() => { focused.current = true; }}
        onPaste={e => {
          e.preventDefault();
          const pasted = e.clipboardData.getData("text").replace(/[$,\s]/g, "");
          if (pasted === "" || /^-?\d*\.?\d*$/.test(pasted)) {
            setDisplay(pasted);
            const num = parseFloat(pasted);
            if (!isNaN(num)) onChange(num);
          }
        }}
        onChange={e => {
          const raw = e.target.value;
          if (raw === "" || /^-?\d*\.?\d*$/.test(raw)) {
            setDisplay(raw);
            const num = parseFloat(raw);
            if (!isNaN(num)) onChange(num);
          }
        }}
        onBlur={() => {
          focused.current = false;
          const num = parseFloat(display);
          const final = isNaN(num) ? 0 : num;
          setDisplay(String(final));
          onChange(final);
        }}
        style={{ width: "100%", padding: "9px 12px", background: "#f5f1e8", border: "1px solid #c8bba5", borderRadius: 6, fontSize: 13, color: "#3d2e1e", fontFamily: "'Jost', sans-serif", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
};

const Btn = ({ onClick, children, variant = "primary", style = {} }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: variant === "primary" ? "#2d4a35" : "transparent",
    color: variant === "primary" ? "#faf7f2" : "#7a6045",
    border: variant === "primary" ? "none" : "1px solid #c8bba5",
    borderRadius: 100,
    padding: variant === "primary" ? "8px 20px" : "7px 18px",
    fontSize: "0.72rem",
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "background 0.2s",
    ...style,
  }}>{children}</button>
);

// ── localStorage helpers ─────────────────────────────────────
const STORAGE_KEYS = { accounts: "budget_accounts_v2", budget: "budget_data_monthly_v2", netWorth: "budget_networth", businessBudget: "business_budget_v2", personalCategories: "personal_categories_v3", businessCategories: "business_categories_v2", businessMonthly: "business_monthly_v2" };

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
    const savedMonths = new Set(saved.map(r => r.period));
    const missing = monthNames
      .filter(m => !savedMonths.has(m))
      .map(m => ({ period: m, carryover: 0, income: 0, misc: 0, totalIncome: 0, mortgage: 0, water: 0, housekeeping: 0, preschool: 0, cash: 0, chase: 0, robinhood: 0, totalExpense: 0, balance: 0 }));
    if (!missing.length) return saved;
    return [...saved, ...missing].sort((a, b) => monthNames.indexOf(a.period) - monthNames.indexOf(b.period));
  });
  const [businessBudget, setBusinessBudget] = useState(() => loadState(STORAGE_KEYS.businessBudget, initialBusinessData));
  const [editingAccount, setEditingAccount] = useState(null);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "Checking", balance: 0 });
  const [overviewRange, setOverviewRange] = useState("ytd");
  const [overviewMonth, setOverviewMonth] = useState("March");
  const [editingMonth, setEditingMonth] = useState(null);
  const [editingMonthDraft, setEditingMonthDraft] = useState(null);
  const [managingCategories, setManagingCategories] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ label: "", type: "expense" });
  const [managingBizCategories, setManagingBizCategories] = useState(false);
  const [newBizCategoryForm, setNewBizCategoryForm] = useState({ label: "", type: "expense" });
  const [editingBizMonth, setEditingBizMonth] = useState(null);
  const [editingBizMonthDraft, setEditingBizMonthDraft] = useState(null);
  const [businessCategories, setBusinessCategories] = useState(() => loadState(STORAGE_KEYS.businessCategories, [
    { id: "carryover",       label: "Carryover",  type: "income"  },
    { id: "consulting",      label: "Consulting", type: "income"  },
    { id: "sunderMed",       label: "SunderMed",  type: "income"  },
    { id: "miscTransfer",    label: "Misc",        type: "income"  },
    { id: "salary",          label: "Salary",     type: "expense" },
    { id: "tax",             label: "Tax",        type: "expense" },
    { id: "healthInsurance", label: "Health",     type: "expense" },
    { id: "autoLoan",        label: "Auto Loan",  type: "expense" },
    { id: "autoInsurance",   label: "Auto Ins",   type: "expense" },
    { id: "utilities",       label: "Utilities",  type: "expense" },
    { id: "chase",           label: "Chase",      type: "expense" },
    { id: "misc",            label: "Misc",       type: "expense" },
    { id: "capitalOne",      label: "Cap One",    type: "expense" },
  ]));
  const [businessMonthly, setBusinessMonthly] = useState(() => loadState(STORAGE_KEYS.businessMonthly, initialMonthlyBusinessData));
  const [personalCategories, setPersonalCategories] = useState(() => loadState(STORAGE_KEYS.personalCategories, [
    { id: "carryover",    label: "Carryover",  type: "income"  },
    { id: "income",       label: "Income",     type: "income"  },
    { id: "misc",         label: "Misc",       type: "income"  },
    { id: "mortgage",     label: "Mortgage",   type: "expense" },
    { id: "water",        label: "Water",       type: "expense" },
    { id: "housekeeping", label: "Housekeep",  type: "expense" },
    { id: "preschool",    label: "Pre-School", type: "expense" },
    { id: "cash",         label: "Cash",        type: "expense" },
    { id: "chase",        label: "Chase",       type: "expense" },
    { id: "robinhood",    label: "Robinhood",  type: "expense" },
  ]));

  // ── Persist to localStorage on change ────────────────────
  useEffect(() => { saveState(STORAGE_KEYS.accounts, accounts); }, [accounts]);
  useEffect(() => { saveState(STORAGE_KEYS.budget, budget); }, [budget]);
  useEffect(() => { saveState(STORAGE_KEYS.businessBudget, businessBudget); }, [businessBudget]);
  useEffect(() => { saveState(STORAGE_KEYS.personalCategories, personalCategories); }, [personalCategories]);
  useEffect(() => { saveState(STORAGE_KEYS.businessCategories, businessCategories); }, [businessCategories]);
  useEffect(() => { saveState(STORAGE_KEYS.businessMonthly, businessMonthly); }, [businessMonthly]);

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
    const expCats = personalCategories.filter(c => c.type === "expense");
    const totals = {};
    expCats.forEach(c => { totals[c.label] = 0; });
    budget.forEach(b => expCats.forEach(c => { totals[c.label] = (totals[c.label] || 0) + (b[c.id] || 0); }));
    return Object.entries(totals).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [budget, personalCategories]);

  const netWorthPie = useMemo(() =>
    netWorthItems.filter(i => i.value > 0).map(i => ({ ...i })), []);

  const MONTH_ORDER = monthNames;
  const CURRENT_MONTH_IDX = 2; // March 2026
  const monthlyBudget = budget;

  const overviewData = useMemo(() => {
    if (overviewRange === "ytd") return monthlyBudget.filter((_, i) => i <= CURRENT_MONTH_IDX);
    if (overviewRange === "month") return monthlyBudget.filter(r => r.period === overviewMonth);
    return monthlyBudget;
  }, [overviewRange, overviewMonth, monthlyBudget]);
  const overviewIncome = useMemo(() => {
    const incCats = personalCategories.filter(c => c.type === "income");
    return overviewData.reduce((s, r) => s + incCats.reduce((si, c) => si + (r[c.id] || 0), 0), 0);
  }, [overviewData, personalCategories]);
  const overviewExpenses = useMemo(() => {
    const expCats = personalCategories.filter(c => c.type === "expense");
    return overviewData.reduce((s, r) => s + expCats.reduce((se, c) => se + (r[c.id] || 0), 0), 0);
  }, [overviewData, personalCategories]);

  // businessMonthly is now the editable monthly state (replaces derived monthlyBusinessBudget)

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
      p.totalIncome = personalCategories.filter(c => c.type === "income").reduce((s, c) => s + (p[c.id] || 0), 0);
      p.totalExpense = personalCategories
        .filter(c => c.type === "expense")
        .reduce((s, c) => s + (p[c.id] || 0), 0);
      p.balance = p.totalIncome - p.totalExpense;
      return updated;
    });
  }, [personalCategories]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh", background: "#faf7f2",
      color: "#3d2e1e", fontFamily: "'Jost', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#faf7f2", borderBottom: "1px solid #e0d8ca",
        padding: "14px 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem",
            fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#3d2e1e",
          }}>
            Lotus<em style={{ fontStyle: "italic", fontWeight: 400 }}>Ledger</em>
          </div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: "0.6rem",
            letterSpacing: "0.15em", textTransform: "uppercase", color: "#a89070", marginTop: 2,
          }}>Personal Finance · 2026</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
      <div style={{ padding: "28px 28px 0" }}>

      {/* ════ OVERVIEW TAB ════ */}
      {tab === "overview" && (
        <>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(212,201,176,0.35)", borderRadius: 100, padding: 3, display: "inline-flex", gap: 2 }}>
              {[["ytd","YTD"],["month","Monthly"],["forecast","Full Year"]].map(([r,label]) => (
                <button key={r} onClick={() => setOverviewRange(r)} style={{
                  padding: "5px 16px", fontSize: "0.65rem", fontFamily: "'Syne', sans-serif",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  borderRadius: 100, border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: overviewRange === r ? "#2d4a35" : "transparent",
                  color: overviewRange === r ? "#faf7f2" : "#a89070",
                }}>{label}</button>
              ))}
            </div>
            {overviewRange === "month" && (
              <select value={overviewMonth} onChange={e => setOverviewMonth(e.target.value)} style={{
                padding: "6px 12px", borderRadius: 100, border: "1px solid #c8bba5",
                background: "#faf7f2", color: "#3d2e1e", fontSize: "0.72rem",
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
                      <stop offset="0%" stopColor="#2d4a35" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#2d4a35" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A63D3D" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#A63D3D" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ca" strokeWidth={0.5} />
                  <XAxis dataKey="period" tick={{ fill: "#a89070", fontSize: 9, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} />
                  <YAxis tickFormatter={fmt} tick={{ fill: "#a89070", fontSize: 9, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="totalIncome" stroke="#2d4a35" strokeWidth={2} fill="url(#incG)" name="Income" />
                  <Area type="monotone" dataKey="totalExpense" stroke="#A63D3D" strokeWidth={2} fill="url(#expG)" name="Expenses" />
                  <Legend wrapperStyle={{ color: "#a89070", fontSize: 10, fontFamily: "Jost", paddingTop: 8 }} />
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
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#faf7f2", border: "1px solid #e0d8ca", borderRadius: 8, color: "#3d2e1e" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", marginTop: 14 }}>
                {expenseBreakdown.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#a89070" }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ca" strokeWidth={0.5} />
                <XAxis dataKey="period" tick={{ fill: "#a89070", fontSize: 9, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: "#a89070", fontSize: 9, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="balance" stroke="#b5703a" strokeWidth={2} dot={{ r: 4, fill: "#b5703a", stroke: "#faf7f2", strokeWidth: 2 }} name="Balance" />
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
            <Btn variant="primary" onClick={() => setManagingCategories(true)}>Manage Categories</Btn>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: Math.max(900, 300 + personalCategories.length * 100) }}>
              <thead>
                <tr>
                  {["Period", ...personalCategories.map(c => c.label), "Total In", "Total Exp", "Balance", ""].map((h, hi, arr) => (
                    <th key={`${h}-${hi}`} style={{
                      textAlign: h === "Period" || h === "" ? "left" : "right",
                      padding: "8px 12px", background: "rgba(212,201,176,0.3)",
                      color: "#a89070", fontWeight: 500, fontSize: "0.58rem", whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.12em",
                      fontFamily: "'Syne', sans-serif",
                      borderRadius: hi === 0 ? "6px 0 0 6px" : hi === arr.length - 1 ? "0 6px 6px 0" : 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyBudget.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #e0d8ca" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(212,201,176,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px 12px", color: "#3d2e1e", fontWeight: 500 }}>{row.period}</td>
                    {personalCategories.map(cat => {
                      const val = row[cat.id] || 0;
                      return (
                        <td key={cat.id} style={{ textAlign: "right", padding: "10px 12px", color: "#7a6045", fontFamily: "'Jost', sans-serif", fontSize: 11 }}>
                          {val === 0 ? "—" : fmtFull(val)}
                        </td>
                      );
                    })}
                    {(() => {
                      const totalIn = personalCategories.filter(c => c.type === "income").reduce((s, c) => s + (row[c.id] || 0), 0);
                      const totalExp = personalCategories.filter(c => c.type === "expense").reduce((s, c) => s + (row[c.id] || 0), 0);
                      const bal = totalIn - totalExp;
                      return (<>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: "#2d4a35", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{totalIn === 0 ? "—" : fmtFull(totalIn)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: "#A63D3D", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{totalExp === 0 ? "—" : fmtFull(totalExp)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: bal < 0 ? "#A63D3D" : "#2d4a35", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{fmtFull(bal)}</td>
                      </>);
                    })()}
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => { setEditingMonthDraft({ ...row }); setEditingMonth(row.period); }} style={{
                        padding: "4px 12px", borderRadius: 100, border: "none", cursor: "pointer",
                        background: "#eaf2ec", color: "#2d4a35", fontSize: "0.65rem",
                        fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "0.06em",
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1.5px solid #c8bba5" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#3d2e1e", fontFamily: "'Syne', sans-serif", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Totals</td>
                  {personalCategories.map(cat => (
                    <td key={cat.id} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#3d2e1e", fontFamily: "'Jost', sans-serif" }}>
                      {fmtFull(monthlyBudget.reduce((s, r) => s + (r[cat.id] || 0), 0))}
                    </td>
                  ))}
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#2d4a35", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(monthlyBudget.reduce((s, r) => s + personalCategories.filter(c => c.type === "income").reduce((si, c) => si + (r[c.id] || 0), 0), 0))}
                  </td>
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#A63D3D", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(monthlyBudget.reduce((s, r) => s + personalCategories.filter(c => c.type === "expense").reduce((se, c) => se + (r[c.id] || 0), 0), 0))}
                  </td>
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#3d2e1e", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(monthlyBudget.reduce((s, r) => {
                      const ti = personalCategories.filter(c => c.type === "income").reduce((si, c) => si + (r[c.id] || 0), 0);
                      const te = personalCategories.filter(c => c.type === "expense").reduce((se, c) => se + (r[c.id] || 0), 0);
                      return s + (ti - te);
                    }, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* ════ BUSINESS TAB ════ */}
      {tab === "business" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <CardTitle>Business Budget — 2026 (Monthly)</CardTitle>
            <Btn variant="primary" onClick={() => setManagingBizCategories(true)}>Manage Categories</Btn>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: Math.max(900, 300 + businessCategories.length * 100) }}>
              <thead>
                <tr>
                  {["Period", ...businessCategories.map(c => c.label), "Total In", "Total Exp", "Balance", ""].map((h, hi, arr) => (
                    <th key={`${h}-${hi}`} style={{
                      textAlign: h === "Period" || h === "" ? "left" : "right",
                      padding: "8px 12px", background: "rgba(212,201,176,0.3)",
                      color: "#a89070", fontWeight: 500, fontSize: "0.58rem", whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif",
                      borderRadius: hi === 0 ? "6px 0 0 6px" : hi === arr.length - 1 ? "0 6px 6px 0" : 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {businessMonthly.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #e0d8ca" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(212,201,176,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px 12px", color: "#3d2e1e", fontWeight: 500 }}>{row.period}</td>
                    {businessCategories.map(cat => {
                      const val = row[cat.id] || 0;
                      return (
                        <td key={cat.id} style={{ textAlign: "right", padding: "10px 12px", color: "#7a6045", fontFamily: "'Jost', sans-serif", fontSize: 11 }}>
                          {val === 0 ? "—" : fmtFull(val)}
                        </td>
                      );
                    })}
                    {(() => {
                      const totalIn = businessCategories.filter(c => c.type === "income").reduce((s, c) => s + (row[c.id] || 0), 0);
                      const totalExp = businessCategories.filter(c => c.type === "expense").reduce((s, c) => s + (row[c.id] || 0), 0);
                      const bal = totalIn - totalExp;
                      return (<>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: "#2d4a35", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{totalIn === 0 ? "—" : fmtFull(totalIn)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: "#A63D3D", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{totalExp === 0 ? "—" : fmtFull(totalExp)}</td>
                        <td style={{ textAlign: "right", padding: "10px 12px", color: bal < 0 ? "#A63D3D" : "#2d4a35", fontWeight: 500, fontFamily: "'Jost', sans-serif", fontSize: 11 }}>{fmtFull(bal)}</td>
                      </>);
                    })()}
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => { setEditingBizMonthDraft({ ...row }); setEditingBizMonth(row.period); }} style={{
                        padding: "4px 12px", borderRadius: 100, border: "none", cursor: "pointer",
                        background: "#eaf2ec", color: "#2d4a35", fontSize: "0.65rem",
                        fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "0.06em",
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1.5px solid #c8bba5" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#3d2e1e", fontFamily: "'Syne', sans-serif", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Totals</td>
                  {businessCategories.map(cat => (
                    <td key={cat.id} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#3d2e1e", fontFamily: "'Jost', sans-serif" }}>
                      {fmtFull(businessMonthly.reduce((s, r) => s + (r[cat.id] || 0), 0))}
                    </td>
                  ))}
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#2d4a35", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(businessMonthly.reduce((s, r) => s + businessCategories.filter(c => c.type === "income").reduce((si, c) => si + (r[c.id] || 0), 0), 0))}
                  </td>
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#A63D3D", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(businessMonthly.reduce((s, r) => s + businessCategories.filter(c => c.type === "expense").reduce((se, c) => se + (r[c.id] || 0), 0), 0))}
                  </td>
                  <td style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, fontSize: 11, color: "#3d2e1e", fontFamily: "'Jost', sans-serif" }}>
                    {fmtFull(businessMonthly.reduce((s, r) => {
                      const ti = businessCategories.filter(c => c.type === "income").reduce((si, c) => si + (r[c.id] || 0), 0);
                      const te = businessCategories.filter(c => c.type === "expense").reduce((se, c) => se + (r[c.id] || 0), 0);
                      return s + (ti - te);
                    }, 0))}
                  </td>
                  <td></td>
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
                  {["Account", "Type", "Balance", "Last Updated", "Actions"].map((h, hi) => (
                    <th key={h} style={{
                      textAlign: h === "Balance" ? "right" : "left", padding: "8px 12px",
                      background: "rgba(212,201,176,0.3)", color: "#a89070", fontWeight: 500, fontSize: "0.58rem",
                      textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif",
                      borderRadius: hi === 0 ? "6px 0 0 6px" : hi === 4 ? "0 6px 6px 0" : 0,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...accounts].sort((a, b) => a.type.localeCompare(b.type)).map((a) => {
                  const badgeStyle = (() => {
                    if (a.type === "Credit Card") return { bg: "rgba(166,61,61,0.09)", color: "#A63D3D", border: "1px solid rgba(166,61,61,0.15)" };
                    if (a.type === "Investment")  return { bg: "#eaf0f4", color: "#3a4a5a", border: "1px solid rgba(58,74,90,0.15)" };
                    if (a.type === "Retirement")  return { bg: "#faf0e6", color: "#b5703a", border: "1px solid rgba(181,112,58,0.15)" };
                    if (a.type === "Asset")       return { bg: "rgba(212,201,176,0.4)", color: "#7a6045", border: "1px solid #c8bba5" };
                    return { bg: "#eaf2ec", color: "#2d4a35", border: "1px solid rgba(45,74,53,0.15)" };
                  })();
                  return (
                    <tr key={a.id} style={{ borderBottom: "0.5px solid #e0d8ca" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(212,201,176,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", color: "#3d2e1e", fontWeight: 500 }}>{a.name}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: 100,
                          fontFamily: "'Syne', sans-serif", fontSize: "0.58rem",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          background: badgeStyle.bg, color: badgeStyle.color, border: badgeStyle.border,
                        }}>{a.type}</span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 13, color: a.type === "Credit Card" && a.balance > 0 ? "#A63D3D" : "#3d2e1e" }}>
                        {fmtFull(a.balance)}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#a89070", fontSize: 11 }}>{a.lastUpdated}</td>
                      <td style={{ padding: "10px 12px", display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingAccount(a)} style={{
                          padding: "4px 12px", borderRadius: 100, border: "none", cursor: "pointer",
                          background: "#eaf2ec", color: "#2d4a35", fontSize: "0.65rem",
                          fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "0.06em",
                        }}>Update</button>
                        <button onClick={() => removeAccount(a.id)} style={{
                          padding: "4px 12px", borderRadius: 100, border: "none", cursor: "pointer",
                          background: "rgba(166,61,61,0.09)", color: "#A63D3D", fontSize: "0.65rem",
                          fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: "0.06em",
                        }}>Remove</button>
                      </td>
                    </tr>
                  );
                })}
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
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#faf7f2", border: "1px solid #e0d8ca", borderRadius: 8, color: "#3d2e1e" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "center", marginTop: 14 }}>
                {netWorthPie.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#a89070" }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0d8ca" strokeWidth={0.5} />
                  <XAxis type="number" tickFormatter={fmt} tick={{ fill: "#a89070", fontSize: 9, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#a89070", fontSize: 10, fontFamily: "Jost" }} axisLine={{ stroke: "#e0d8ca" }} tickLine={false} width={120} />
                  <Tooltip formatter={v => fmtFull(v)} contentStyle={{ background: "#faf7f2", border: "1px solid #e0d8ca", borderRadius: 8, color: "#3d2e1e" }} />
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
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>Type</label>
            <select
              value={editingAccount.type}
              onChange={e => setEditingAccount({ ...editingAccount, type: e.target.value })}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #c8bba5",
                background: "#f5f1e8", color: "#3d2e1e", fontSize: 13, fontFamily: "'Jost', sans-serif",
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

      {editingMonth && editingMonthDraft && (
        <Modal title={editingMonth} onClose={() => { setEditingMonth(null); setEditingMonthDraft(null); }}>
          {personalCategories.filter(c => c.type === "income").length > 0 && (
            <div style={{ fontSize: "0.58rem", color: "#a89070", marginBottom: 8, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif", paddingBottom: 6, borderBottom: "1px solid #e0d8ca" }}>Income</div>
          )}
          {personalCategories.filter(c => c.type === "income").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingMonthDraft[cat.id] || 0}
              onChange={v => setEditingMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          {personalCategories.filter(c => c.type === "expense").length > 0 && (
            <div style={{ fontSize: "0.58rem", color: "#a89070", margin: "16px 0 10px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif", paddingBottom: 6, borderBottom: "1px solid #e0d8ca" }}>Expenses</div>
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
              const d = editingMonthDraft;
              const totalIncome = personalCategories.filter(c => c.type === "income").reduce((s, c) => s + (d[c.id] || 0), 0);
              const totalExpense = personalCategories.filter(c => c.type === "expense").reduce((s, c) => s + (d[c.id] || 0), 0);
              setBudget(prev => prev.map(r =>
                r.period === d.period
                  ? { ...d, totalIncome, totalExpense, balance: totalIncome - totalExpense }
                  : r
              ));
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
            <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>Type</label>
            <select
              value={newAccount.type}
              onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #c8bba5",
                background: "#f5f1e8", color: "#3d2e1e", fontSize: 13, fontFamily: "'Jost', sans-serif",
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

      {managingCategories && (
        <Modal title="Manage Categories" onClose={() => setManagingCategories(false)}>
          <div style={{ marginBottom: 4 }}>
            {personalCategories.length === 0 && (
              <div style={{ color: "#a89070", fontSize: 12, padding: "8px 0" }}>No categories yet.</div>
            )}
            {personalCategories.map((cat, idx) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #e0d8ca" }}>
                {/* Up / Down */}
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button disabled={idx === 0} onClick={() => setPersonalCategories(prev => {
                    const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#d4c9b0" : "#a89070", fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▲</button>
                  <button disabled={idx === personalCategories.length - 1} onClick={() => setPersonalCategories(prev => {
                    const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === personalCategories.length - 1 ? "default" : "pointer", color: idx === personalCategories.length - 1 ? "#d4c9b0" : "#a89070", fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▼</button>
                </div>
                {/* Inline rename input */}
                <input
                  value={cat.label}
                  onChange={e => setPersonalCategories(prev => prev.map((c, i) => i === idx ? { ...c, label: e.target.value } : c))}
                  style={{ flex: 1, padding: "5px 8px", background: "#f5f1e8", border: "1px solid #c8bba5", borderRadius: 6, fontSize: 13, color: "#3d2e1e", fontFamily: "'Jost', sans-serif", outline: "none" }}
                />
                {/* Type badge */}
                <span style={{ fontSize: "0.58rem", color: cat.type === "income" ? "#2d4a35" : "#a89070", fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>{cat.type}</span>
                {/* Remove */}
                <button onClick={() => setPersonalCategories(prev => prev.filter((_, i) => i !== idx))} style={{
                  background: "none", border: "none", color: "#A63D3D", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #e0d8ca" }}>
            <div style={{ fontSize: "0.58rem", color: "#a89070", marginBottom: 10, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif" }}>Add Category</div>
            <Input label="Label" type="text" value={newCategoryForm.label} onChange={v => setNewCategoryForm(p => ({ ...p, label: v }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>Type</label>
              <select value={newCategoryForm.type} onChange={e => setNewCategoryForm(p => ({ ...p, type: e.target.value }))} style={{
                width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #c8bba5",
                background: "#f5f1e8", color: "#3d2e1e", fontSize: 13, fontFamily: "'Jost', sans-serif",
              }}>
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
            <div style={{ fontSize: "0.58rem", color: "#a89070", marginBottom: 8, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif", paddingBottom: 6, borderBottom: "1px solid #e0d8ca" }}>Income</div>
          )}
          {businessCategories.filter(c => c.type === "income").map(cat => (
            <Input key={cat.id} label={cat.label}
              value={editingBizMonthDraft[cat.id] || 0}
              onChange={v => setEditingBizMonthDraft(p => ({ ...p, [cat.id]: v }))}
            />
          ))}
          {businessCategories.filter(c => c.type === "expense").length > 0 && (
            <div style={{ fontSize: "0.58rem", color: "#a89070", margin: "16px 0 10px", textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif", paddingBottom: 6, borderBottom: "1px solid #e0d8ca" }}>Expenses</div>
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
              const d = editingBizMonthDraft;
              setBusinessMonthly(prev => prev.map(r => r.period === d.period ? { ...d } : r));
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
              <div style={{ color: "#a89070", fontSize: 12, padding: "8px 0" }}>No categories yet.</div>
            )}
            {businessCategories.map((cat, idx) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "0.5px solid #e0d8ca" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <button disabled={idx === 0} onClick={() => setBusinessCategories(prev => {
                    const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "#d4c9b0" : "#a89070", fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▲</button>
                  <button disabled={idx === businessCategories.length - 1} onClick={() => setBusinessCategories(prev => {
                    const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
                  })} style={{ background: "none", border: "none", cursor: idx === businessCategories.length - 1 ? "default" : "pointer", color: idx === businessCategories.length - 1 ? "#d4c9b0" : "#a89070", fontSize: 10, lineHeight: 1, padding: "1px 3px" }}>▼</button>
                </div>
                <input
                  value={cat.label}
                  onChange={e => setBusinessCategories(prev => prev.map((c, i) => i === idx ? { ...c, label: e.target.value } : c))}
                  style={{ flex: 1, padding: "5px 8px", background: "#f5f1e8", border: "1px solid #c8bba5", borderRadius: 6, fontSize: 13, color: "#3d2e1e", fontFamily: "'Jost', sans-serif", outline: "none" }}
                />
                <span style={{ fontSize: "0.58rem", color: cat.type === "income" ? "#2d4a35" : "#a89070", fontFamily: "'Syne', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: 52 }}>{cat.type}</span>
                <button onClick={() => setBusinessCategories(prev => prev.filter((_, i) => i !== idx))} style={{
                  background: "none", border: "none", color: "#A63D3D", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #e0d8ca" }}>
            <div style={{ fontSize: "0.58rem", color: "#a89070", marginBottom: 10, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.12em", fontFamily: "'Syne', sans-serif" }}>Add Category</div>
            <Input label="Label" type="text" value={newBizCategoryForm.label} onChange={v => setNewBizCategoryForm(p => ({ ...p, label: v }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89070", marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>Type</label>
              <select value={newBizCategoryForm.type} onChange={e => setNewBizCategoryForm(p => ({ ...p, type: e.target.value }))} style={{
                width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #c8bba5",
                background: "#f5f1e8", color: "#3d2e1e", fontSize: 13, fontFamily: "'Jost', sans-serif",
              }}>
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
            fontFamily: "'Syne', sans-serif", fontSize: "0.58rem", fontWeight: 500,
            letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
          }}>Powered by Lotus AI</span>
        </a>
      </div>
    </div>
  );
}
