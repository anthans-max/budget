import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// ── Supabase row IDs (UUID) ─────────────────────────────────
const SUPABASE_ROW_IDS = {
  accounts:           "a1000000-0000-0000-0000-000000000001",
  budget_monthly:     "a1000000-0000-0000-0000-000000000002",
  budget_categories:  "a1000000-0000-0000-0000-000000000003",
  business_budget:    "a1000000-0000-0000-0000-000000000004",
  business_categories:"a1000000-0000-0000-0000-000000000005",
  business_monthly:   "a1000000-0000-0000-0000-000000000006",
};

// ── localStorage keys ───────────────────────────────────────
const STORAGE_KEYS = {
  accounts: "budget_accounts_v2",
  budget: "budget_data_monthly_v2",
  businessBudget: "business_budget_v2",
  personalCategories: "personal_categories_v3",
  businessCategories: "business_categories_v2",
  businessMonthly: "business_monthly_v2",
};

// ── localStorage helpers ────────────────────────────────────
const saveState = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ── Supabase write ──────────────────────────────────────────
const pendingSaves = new Set();
const saveToSupabase = (table, rowId, data) => {
  if (!supabase) return;
  const key = table;
  pendingSaves.add(key);
  supabase.from(table).upsert({ id: rowId, data }, { onConflict: "id" })
    .then(() => pendingSaves.delete(key))
    .catch(() => pendingSaves.delete(key));
};

// ── Month names (shared with App.jsx) ───────────────────────
export const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ── Fill missing months for personal budget ─────────────────
const fillMissingMonths = (saved) => {
  const savedMonths = new Set(saved.map(r => r.period));
  const missing = monthNames
    .filter(m => !savedMonths.has(m))
    .map(m => ({ period: m, carryover: 0, income: 0, misc: 0, totalIncome: 0, mortgage: 0, water: 0, housekeeping: 0, preschool: 0, cash: 0, chase: 0, robinhood: 0, totalExpense: 0, balance: 0 }));
  if (!missing.length) return saved;
  return [...saved, ...missing].sort((a, b) => monthNames.indexOf(a.period) - monthNames.indexOf(b.period));
};

// ── Hardcoded defaults (fallback of last resort) ────────────
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

const defaultPersonalCategories = [
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
];

const defaultBusinessCategories = [
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
];

// ── The Hook ────────────────────────────────────────────────
export function useBudgetData() {
  const [accounts, setAccounts] = useState(null);
  const [budget, setBudget] = useState(null);
  const [personalCategories, setPersonalCategories] = useState(null);
  const [businessBudget, setBusinessBudget] = useState(null);
  const [businessCategories, setBusinessCategories] = useState(null);
  const [businessMonthly, setBusinessMonthly] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);

  // ── Load on mount ──
  useEffect(() => {
    if (!supabase) {
      setAccounts(initialAccounts);
      setBudget(fillMissingMonths(initialBudgetData));
      setPersonalCategories(defaultPersonalCategories);
      setBusinessBudget(initialBusinessData);
      setBusinessCategories(defaultBusinessCategories);
      setBusinessMonthly(initialMonthlyBusinessData);
      isReadyRef.current = true;
      setIsReady(true);
      return;
    }

    let cancelled = false;
    const SUPABASE_MAP = [
      { table: "budget_accounts",     rowId: SUPABASE_ROW_IDS.accounts,            setter: setAccounts,           fallback: initialAccounts,            transform: null },
      { table: "budget_monthly",      rowId: SUPABASE_ROW_IDS.budget_monthly,      setter: setBudget,             fallback: initialBudgetData,          transform: fillMissingMonths },
      { table: "budget_categories",   rowId: SUPABASE_ROW_IDS.budget_categories,   setter: setPersonalCategories, fallback: defaultPersonalCategories,  transform: null },
      { table: "business_budget",     rowId: SUPABASE_ROW_IDS.business_budget,     setter: setBusinessBudget,     fallback: initialBusinessData,        transform: null },
      { table: "business_categories", rowId: SUPABASE_ROW_IDS.business_categories, setter: setBusinessCategories, fallback: defaultBusinessCategories,  transform: null },
      { table: "business_monthly",    rowId: SUPABASE_ROW_IDS.business_monthly,    setter: setBusinessMonthly,    fallback: initialMonthlyBusinessData, transform: null },
    ];

    Promise.allSettled(
      SUPABASE_MAP.map(({ table, rowId }) =>
        supabase.from(table).select("data").eq("id", rowId).single()
      )
    ).then(results => {
      if (cancelled) return;
      results.forEach((result, i) => {
        const { setter, fallback, transform } = SUPABASE_MAP[i];
        if (result.status === "fulfilled" && result.value.data?.data != null) {
          const raw = result.value.data.data;
          setter(transform ? transform(raw) : raw);
        } else {
          setter(transform ? transform(fallback) : fallback);
        }
      });
    }).catch(() => {
      SUPABASE_MAP.forEach(({ setter, fallback, transform }) => {
        setter(transform ? transform(fallback) : fallback);
      });
    }).finally(() => {
      if (!cancelled) {
        isReadyRef.current = true;
        setIsReady(true);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // ── Persist effects (only fire after load completes) ──────
  useEffect(() => { if (isReadyRef.current && accounts !== null) { saveState(STORAGE_KEYS.accounts, accounts); saveToSupabase("budget_accounts", SUPABASE_ROW_IDS.accounts, accounts); } }, [accounts]);
  useEffect(() => { if (isReadyRef.current && budget !== null) { saveState(STORAGE_KEYS.budget, budget); saveToSupabase("budget_monthly", SUPABASE_ROW_IDS.budget_monthly, budget); } }, [budget]);
  useEffect(() => { if (isReadyRef.current && personalCategories !== null) { saveState(STORAGE_KEYS.personalCategories, personalCategories); saveToSupabase("budget_categories", SUPABASE_ROW_IDS.budget_categories, personalCategories); } }, [personalCategories]);
  useEffect(() => { if (isReadyRef.current && businessBudget !== null) { saveState(STORAGE_KEYS.businessBudget, businessBudget); saveToSupabase("business_budget", SUPABASE_ROW_IDS.business_budget, businessBudget); } }, [businessBudget]);
  useEffect(() => { if (isReadyRef.current && businessCategories !== null) { saveState(STORAGE_KEYS.businessCategories, businessCategories); saveToSupabase("business_categories", SUPABASE_ROW_IDS.business_categories, businessCategories); } }, [businessCategories]);
  useEffect(() => { if (isReadyRef.current && businessMonthly !== null) { saveState(STORAGE_KEYS.businessMonthly, businessMonthly); saveToSupabase("business_monthly", SUPABASE_ROW_IDS.business_monthly, businessMonthly); } }, [businessMonthly]);

  // ── Warn on close if saves are in-flight ──────────────────
  useEffect(() => {
    const handler = (e) => { if (pendingSaves.size > 0) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return {
    isReady,
    accounts, setAccounts,
    budget, setBudget,
    personalCategories, setPersonalCategories,
    businessBudget, setBusinessBudget,
    businessCategories, setBusinessCategories,
    businessMonthly, setBusinessMonthly,
  };
}
