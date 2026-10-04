"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  Flame,
  LineChart,
  Moon,
  Pencil,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Trade = {
  id?: string | number;
  date?: string;
  asset?: string;
  trade_type?: string;
  buy_sell?: string;
  result?: string;
  pl_amount?: number | string | null;
  pnl_percentage?: number | string | null;
  trade_number?: number | string | null;
};

type Rule = {
  id: number;
  text: string;
};

type EquityPoint = {
  date: string;
  value: number;
  pl: number;
};

/* =========================================================
   HELPERS
========================================================= */

const money = (value: number, currency = "USD") => {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalMoney = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const num = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

/* =========================================================
   DEFAULT RULES
========================================================= */

const defaultRules: Rule[] = [
  {
    id: 1,
    text: "Always wait for 15m candle close before entry.",
  },
  {
    id: 2,
    text: "Never risk more than 1% of equity per trade.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [initialCapital, setInitialCapital] = useState(10000);

  const [currency, setCurrency] = useState("USD");

  const [loading, setLoading] = useState(true);

  /* ---------------- RULES ---------------- */

  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [newRule, setNewRule] = useState("");
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  /* ---------------- TARGET ---------------- */

  const [target, setTarget] = useState(1000);
  const [targetInput, setTargetInput] = useState("1000");
  const [targetPopup, setTargetPopup] = useState(false);

  /* ---------------- TRADING VIEW ---------------- */

  const [tradingViewUrl, setTradingViewUrl] = useState(
    "https://www.tradingview.com/chart/"
  );

  const [chartInput, setChartInput] = useState(
    "https://www.tradingview.com/chart/"
  );

  /* ---------------- RISK SETTINGS ---------------- */

  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState(1);

  const [riskInput, setRiskInput] = useState("1");

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      /* ===============================================
         ACCOUNT SETTINGS
      =============================================== */

      const { data: account } = await supabase
        .from("account_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (account) {
        if (account.account_size != null) {
          setInitialCapital(num(account.account_size));
        }

        if (account.currency) {
          setCurrency(account.currency);
        }

        if (account.max_daily_loss_percent != null) {
          setMaxDailyLossPercent(
            num(account.max_daily_loss_percent)
          );
          setRiskInput(String(account.max_daily_loss_percent));
        }
      }

      /* ===============================================
         JOURNAL
      =============================================== */

      const { data: journal, error } = await supabase
        .from("trading_journal")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (!error && journal) {
        setTrades(journal as Trade[]);
      }

      /* ===============================================
         LOCAL USER SETTINGS
      =============================================== */

      const rulesKey = `alphametrics_rules_${user.id}`;
      const targetKey = `alphametrics_target_${user.id}`;
      const chartKey = `alphametrics_chart_${user.id}`;

      const savedRules = localStorage.getItem(rulesKey);

      if (savedRules) {
        setRules(JSON.parse(savedRules));
      }

      const savedTarget = localStorage.getItem(targetKey);

      if (savedTarget) {
        const t = num(savedTarget);

        if (t > 0) {
          setTarget(t);
          setTargetInput(String(t));
        }
      }

      const savedChart = localStorage.getItem(chartKey);

      if (savedChart) {
        setTradingViewUrl(savedChart);
        setChartInput(savedChart);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     JOURNAL CALCULATIONS
  ========================================================= */

  const totalTrades = trades.length;

  const wins = trades.filter(
    (trade) =>
      String(trade.result || "").toLowerCase() === "win"
  ).length;

  const losses = trades.filter(
    (trade) =>
      String(trade.result || "").toLowerCase() === "loss"
  ).length;

  const breakevens = trades.filter((trade) => {
    const result = String(trade.result || "").toLowerCase();

    return (
      result === "breakeven" ||
      result === "break even" ||
      result === "be"
    );
  }).length;

  const netPL = trades.reduce(
    (sum, trade) => sum + num(trade.pl_amount),
    0
  );

  const currentBalance = initialCapital + netPL;

  const pnlPercent =
    initialCapital > 0
      ? (netPL / initialCapital) * 100
      : 0;

  const winRate =
    totalTrades > 0
      ? (wins / totalTrades) * 100
      : 0;

  /* =========================================================
     TODAY
  ========================================================= */

  const today = todayISO();

  const todayTrades = trades.filter((trade) => {
    if (!trade.date) return false;

    return String(trade.date).slice(0, 10) === today;
  });

  const todayPL = todayTrades.reduce(
    (sum, trade) => sum + num(trade.pl_amount),
    0
  );

  const todayTradeCount = todayTrades.length;

  /* =========================================================
     RISK
  ========================================================= */

  const maxDailyLossAmount =
    (currentBalance * maxDailyLossPercent) / 100;

  const remainingDailyLoss = Math.max(
    0,
    maxDailyLossAmount + todayPL
  );

  const riskPerTrade =
    (currentBalance * maxDailyLossPercent) / 100;

  const targetProfitRemaining = Math.max(
    0,
    target - netPL
  );

  const drawdownAmount = Math.max(
    0,
    initialCapital - currentBalance
  );

  const drawdownPercent =
    initialCapital > 0
      ? (drawdownAmount / initialCapital) * 100
      : 0;

  /* =========================================================
     EQUITY CURVE
  ========================================================= */

  const equityCurve = useMemo<EquityPoint[]>(() => {
    const grouped = new Map<string, number>();

    trades.forEach((trade) => {
      if (!trade.date) return;

      const date = String(trade.date).slice(0, 10);
      const pl = num(trade.pl_amount);

      grouped.set(date, (grouped.get(date) || 0) + pl);
    });

    let equity = initialCapital;

    const result: EquityPoint[] = [];

    Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, pl]) => {
        equity += pl;

        result.push({
          date,
          pl,
          value: equity,
        });
      });

    if (result.length === 0) {
      result.push({
        date: today,
        pl: 0,
        value: initialCapital,
      });
    }

    return result;
  }, [trades, initialCapital, today]);

  /* =========================================================
     TARGET CHECK
  ========================================================= */

  useEffect(() => {
    if (netPL >= target && target > 0) {
      const key = `alphametrics_target_reached_${userId}_${target}`;

      if (!localStorage.getItem(key)) {
        setTargetPopup(true);
        localStorage.setItem(key, "true");
      }
    }
  }, [netPL, target, userId]);

  /* =========================================================
     RULE FUNCTIONS
  ========================================================= */

  function saveRules() {
    if (!userId) return;

    localStorage.setItem(
      `alphametrics_rules_${userId}`,
      JSON.stringify(rules)
    );
  }

  function addRule() {
    const text = newRule.trim();

    if (!text) return;

    const nextId =
      rules.length > 0
        ? Math.max(...rules.map((r) => r.id)) + 1
        : 1;

    const updated = [
      ...rules,
      {
        id: nextId,
        text,
      },
    ];

    setRules(updated);
    setNewRule("");

    if (userId) {
      localStorage.setItem(
        `alphametrics_rules_${userId}`,
        JSON.stringify(updated)
      );
    }
  }

  function deleteRule(id: number) {
    const updated = rules.filter((rule) => rule.id !== id);

    setRules(updated);

    if (userId) {
      localStorage.setItem(
        `alphametrics_rules_${userId}`,
        JSON.stringify(updated)
      );
    }
  }

  function startEditRule(rule: Rule) {
    setEditingRule(rule.id);
    setEditingText(rule.text);
  }

  function saveEditedRule(id: number) {
    const text = editingText.trim();

    if (!text) return;

    const updated = rules.map((rule) =>
      rule.id === id
        ? {
            ...rule,
            text,
          }
        : rule
    );

    setRules(updated);
    setEditingRule(null);
    setEditingText("");

    if (userId) {
      localStorage.setItem(
        `alphametrics_rules_${userId}`,
        JSON.stringify(updated)
      );
    }
  }

  

  /* =========================================================
     CHART
  ========================================================= */

  function saveTradingView() {
    const url = chartInput.trim();

    if (!url) return;

    setTradingViewUrl(url);

    if (userId) {
      localStorage.setItem(
        `alphametrics_chart_${userId}`,
        url
      );
    }
  }

  /* =========================================================
     SAVE RISK
  ========================================================= */

  async function saveRiskSetting() {
    const value = num(riskInput);

    if (value <= 0 || !userId) return;

    setMaxDailyLossPercent(value);

    const { error } = await supabase
      .from("account_settings")
      .update({
        max_daily_loss_percent: value,
      })
      .eq("user_id", userId);

    if (error) {
      console.error(error);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <p className="text-slate-400">
            Loading AlphaMetrics...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071321]/95 backdrop-blur-xl">
        <div className="px-5 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              AlphaMetrics
            </h1>

            <p className="text-[11px] text-slate-500">
              Trade Smarter | Build Consistency | Create Freedom
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span>
              “Discipline is the bridge between your goals and
              your success.”
            </span>

            <Bell size={16} />

            <Moon size={16} />

            <span className="text-white font-medium">
              Trader
            </span>

            <ChevronRight size={14} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="p-4 md:p-5">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] gap-4">
          {/* =================================================
              LEFT
          ================================================= */}

          <section className="space-y-4">
            {/* HERO + RULES ON RIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-4">
              {/* HERO */}
              <div className="relative min-h-[210px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#172b43] via-[#10243a] to-[#07111e]">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#60a5fa,transparent_30%),radial-gradient(circle_at_80%_20%,#22c55e,transparent_25%)]" />

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="relative h-full min-h-[210px] flex items-center px-7 md:px-10">
                  <div className="max-w-xl">
                    <p className="text-xs uppercase tracking-[0.25em] text-blue-300 mb-3">
                      Trader Mindset
                    </p>

                    <h2 className="text-4xl md:text-5xl font-black leading-[0.95]">
                      Small Steps
                      <br />
                      <span className="text-blue-300">
                        Big Results.
                      </span>
                    </h2>

                    <div className="mt-4 flex gap-5 text-xs text-slate-300">
                      <span>Discipline</span>
                      <span>•</span>
                      <span>Patience</span>
                      <span>•</span>
                      <span>Consistency</span>
                    </div>
                  </div>

                  <div className="hidden md:block absolute right-8 top-7 rotate-[-7deg] text-right">
                    <p className="font-serif italic text-2xl text-white">
                      Better
                    </p>
                    <p className="font-serif italic text-2xl text-white">
                      Trader
                    </p>
                    <p className="font-serif italic text-2xl text-blue-300">
                      Everyday
                    </p>
                  </div>
                </div>
              </div>

              {/* RULES */}
              <div className="rounded-2xl border border-white/10 bg-[#0b192a] p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className="text-blue-400"
                    />

                    <h3 className="font-semibold">
                      My Trading Rules
                    </h3>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {rules.length} rules
                  </span>
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {rules.map((rule, index) => (
                    <div
                      key={rule.id}
                      className="flex items-start gap-2"
                    >
                      <span className="text-xs text-slate-500 mt-2 w-4">
                        {index + 1}.
                      </span>

                      {editingRule === rule.id ? (
                        <div className="flex-1 flex gap-1">
                          <input
                            value={editingText}
                            onChange={(e) =>
                              setEditingText(e.target.value)
                            }
                            className="min-w-0 flex-1 rounded-lg border border-blue-400/50 bg-[#071321] px-2 py-2 text-xs outline-none"
                          />

                          <button
                            onClick={() =>
                              saveEditedRule(rule.id)
                            }
                            className="rounded-lg bg-emerald-500 px-2 text-white"
                          >
                            <Save size={13} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 rounded-lg border border-white/10 bg-[#091523] px-2.5 py-2 text-xs text-slate-300">
                            {rule.text}
                          </div>

                          <button
                            onClick={() => startEditRule(rule)}
                            className="mt-2 text-slate-500 hover:text-blue-400"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="mt-2 text-slate-500 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addRule();
                    }}
                    placeholder="Add your trading rule..."
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#071321] px-3 py-2 text-xs outline-none focus:border-blue-400/50"
                  />

                  <button
                    onClick={addRule}
                    className="rounded-lg bg-blue-500 px-3 hover:bg-blue-400"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={saveRules}
                  className="mt-3 w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold hover:bg-blue-500"
                >
                  <Save
                    size={13}
                    className="inline mr-1"
                  />
                  Save Rules Configuration
                </button>
              </div>
            </div>

            {/* =================================================
                TOP METRICS
            ================================================= */}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                icon={<Wallet size={17} />}
                label="Initial Capital"
                value={normalMoney(initialCapital)}
                sub="Account Settings"
              />

              <MetricCard
                icon={<CircleDollarSign size={17} />}
                label="Current Balance"
                value={normalMoney(currentBalance)}
                sub={`${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(
                  2
                )}%`}
                positive={pnlPercent >= 0}
              />

              <MetricCard
                icon={<TrendingUp size={17} />}
                label="Net P/L"
                value={money(netPL, currency)}
                sub="Journal"
                positive={netPL >= 0}
              />

              <MetricCard
                icon={<BarChart3 size={17} />}
                label="P/L %"
                value={`${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(
                  2
                )}%`}
                sub="Balance Growth"
                positive={pnlPercent >= 0}
              />
            </div>

            {/* =================================================
                JOURNAL STATS
            ================================================= */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <SmallStat
                label="Total Trades"
                value={totalTrades}
              />

              <SmallStat
                label="Wins"
                value={wins}
                percent={
                  totalTrades
                    ? `${((wins / totalTrades) * 100).toFixed(
                        2
                      )}%`
                    : "0%"
                }
                positive
              />

              <SmallStat
                label="Losses"
                value={losses}
                percent={
                  totalTrades
                    ? `${((losses / totalTrades) * 100).toFixed(
                        2
                      )}%`
                    : "0%"
                }
                negative
              />

              <SmallStat
                label="Breakeven"
                value={breakevens}
              />

              <SmallStat
                label="Win Rate"
                value={`${winRate.toFixed(2)}%`}
                positive={winRate >= 50}
              />
            </div>

            {/* =================================================
                EQUITY CURVE
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-[#0b192a] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LineChart
                    size={16}
                    className="text-blue-400"
                  />

                  <div>
                    <h3 className="font-semibold">
                      Account Equity Curve
                    </h3>

                    <p className="text-[11px] text-slate-500">
                      Day-by-day account growth / loss
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="rounded-md bg-blue-500/15 px-2 py-1 text-[10px] text-blue-300">
                    Daily P/L
                  </span>

                  <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                    Target: {normalMoney(target)}
                  </span>
                </div>
              </div>

              <EquityChart
                data={equityCurve}
                target={initialCapital + target}
              />

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">
                    Start
                  </p>
                  <p className="font-semibold">
                    {normalMoney(initialCapital)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">
                    Current
                  </p>
                  <p className="font-semibold text-emerald-400">
                    {normalMoney(currentBalance)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-slate-500">
                    Target
                  </p>
                  <p className="font-semibold text-blue-400">
                    {normalMoney(initialCapital + target)}
                  </p>
                </div>
              </div>
            </div>

            

            {/* =================================================
                PROP FIRM RISK
            ================================================= */}

            <div className="rounded-1xl border border-white/10 bg-[#0b192a] p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-400"
                    />

                    <h3 className="font-semibold">
                      Prop Firm Risk Summary
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Risk calculated from your account rules
                  </p>
                </div>

                
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <RiskBox
                  label="Daily Loss Limit"
                  value={normalMoney(maxDailyLossAmount)}
                  extra={
                    <input
                      value={riskInput}
                      onChange={(e) =>
                        setRiskInput(e.target.value)
                      }
                      type="number"
                      className="mt-2 w-full rounded-md border border-white/10 bg-[#071321] px-2 py-1 text-[11px]"
                    />
                  }
                />

                <RiskBox
                  label="Today's P/L"
                  value={money(todayPL)}
                  positive={todayPL >= 0}
                />

                <RiskBox
                  label="Remaining Daily Loss"
                  value={normalMoney(remainingDailyLoss)}
                  positive
                />

                <RiskBox
                  label="Today's Trades"
                  value={String(todayTradeCount)}
                />

                <RiskBox
                  label="Risk / Trade"
                  value={normalMoney(riskPerTrade)}
                  extra={
                    <span className="text-[10px] text-emerald-400">
                      {maxDailyLossPercent}% account risk
                    </span>
                  }
                />
              </div>

              <div className="mt-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <Flame
                    size={16}
                    className="text-blue-400"
                  />

                  <p className="text-xs text-slate-300">
                    You need{" "}
                    <span className="font-bold text-blue-300">
                      {normalMoney(targetProfitRemaining)}
                    </span>{" "}
                    more profit to reach your target.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                MOTIVATION
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MotivationCard
                title="PLAN"
                text="Plan the trade. Do not trade the market."
              />

              <MotivationCard
                title="DISCIPLINE"
                text="Your edge only works when you follow your rules."
              />

              <MotivationCard
                title="REPEAT"
                text="One good trade means nothing. Consistency means everything."
              />
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="space-y-4">
            {/* =================================================
                RECENT TRADES
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-[#0b192a] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  Recent Trades
                </h3>

                <span className="text-[10px] text-slate-500">
                  Journal
                </span>
              </div>

              <div className="space-y-2">
                {trades
                  .slice(-5)
                  .reverse()
                  .map((trade, index) => {
                    const pl = num(trade.pl_amount);

                    const isWin =
                      String(
                        trade.result || ""
                      ).toLowerCase() === "win";

                    const isLoss =
                      String(
                        trade.result || ""
                      ).toLowerCase() === "loss";

                    return (
                      <div
                        key={
                          String(
                            trade.id || index
                          )
                        }
                        className="flex items-center justify-between rounded-xl bg-[#071321] border border-white/5 p-2.5"
                      >
                        <div>
                          <p className="text-xs font-semibold">
                            {trade.asset || "Unknown"}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            {formatDate(trade.date)} ·{" "}
                            {trade.trade_type || "Trade"}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[9px] rounded px-1.5 py-0.5 ${
                              isWin
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isLoss
                                ? "bg-red-500/10 text-red-400"
                                : "bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {trade.result || "—"}
                          </span>

                          <p
                            className={`text-xs font-semibold mt-1 ${
                              pl >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {money(pl)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                {trades.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No journal trades yet.
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                TRADING VIEW
            ================================================= */}

            <div className="rounded-2xl border border-white/10 bg-[#0b192a] overflow-hidden">
              <div className="p-4 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    TradingView Live Chart
                  </h3>

                  <p className="text-[10px] text-slate-500">
                    User configured chart
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      tradingViewUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="text-[10px] text-blue-400 hover:text-blue-300"
                >
                  Open in TradingView
                  <ExternalLink
                    size={11}
                    className="inline ml-1"
                  />
                </button>
              </div>

              <div className="h-[235px] bg-[#050b13] relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute left-0 right-0 top-[25%] border-t border-white/10" />
                  <div className="absolute left-0 right-0 top-[50%] border-t border-white/10" />
                  <div className="absolute left-0 right-0 top-[75%] border-t border-white/10" />

                  <div className="absolute top-0 bottom-0 left-[25%] border-l border-white/10" />
                  <div className="absolute top-0 bottom-0 left-[50%] border-l border-white/10" />
                  <div className="absolute top-0 bottom-0 left-[75%] border-l border-white/10" />
                </div>

                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 500 235"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,190 25,175 50,184 70,160 90,166 110,140 130,148 150,125 170,135 190,118 210,130 230,105 250,112 270,96 290,110 310,85 330,94 350,70 370,79 390,55 410,67 430,48 455,58 480,35 500,40"
                    fill="none"
                    stroke="currentColor"
                    className="text-emerald-400"
                    strokeWidth="2"
                  />
                </svg>

                <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[10px]">
                  XAUUSD · 15m
                </div>
              </div>

              <div className="p-3 flex gap-2">
                <input
                  value={chartInput}
                  onChange={(e) =>
                    setChartInput(e.target.value)
                  }
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#071321] px-2 py-2 text-[10px] outline-none"
                  placeholder="TradingView chart URL"
                />

                <button
                  onClick={saveTradingView}
                  className="rounded-lg bg-blue-600 px-3"
                >
                  <Save size={13} />
                </button>
              </div>
            </div>

            {/* =================================================
                TARGET CARD
            ================================================= */}

            <div className="rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-500/10 to-transparent p-4">
              <div className="flex items-center gap-2">
                <Trophy
                  size={18}
                  className="text-amber-400"
                />

                <h3 className="font-semibold">
                  Your Target
                </h3>
              </div>

              <p className="mt-4 text-3xl font-black">
                {normalMoney(target)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Profit target
              </p>

              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (netPL / target) * 100
                      )
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                {Math.min(
                  100,
                  Math.max(
                    0,
                    (netPL / target) * 100
                  )
                ).toFixed(1)}
                % completed
              </p>
            </div>

            {/* =================================================
                DISCIPLINE QUOTE
            ================================================= */}

            <div className="relative overflow-hidden rounded-2xl border border-white/10 min-h-[175px] bg-gradient-to-br from-[#172a42] to-[#091422]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-serif italic text-lg text-white">
                  “The goal isn't to be perfect.
                  <br />
                  It's to be better than yesterday.”
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          TARGET POPUP
      ===================================================== */}

      {targetPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-400/30 bg-[#0b192a] p-7 text-center shadow-2xl">
            <button
              onClick={() => setTargetPopup(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Trophy
                size={32}
                className="text-emerald-400"
              />
            </div>

            <p className="mt-5 text-sm uppercase tracking-[0.25em] text-emerald-400">
              Target Hunt
            </p>

            <h2 className="mt-2 text-3xl font-black">
              YOUR TARGET HIT
            </h2>

            <p className="mt-4 text-lg text-white">
              Well done, Trader.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              You reached your target of{" "}
              <span className="font-semibold text-emerald-400">
                {normalMoney(target)}
              </span>
              .
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-serif italic text-slate-300">
                “Discipline created this result.
                <br />
                Now protect it.”
              </p>
            </div>

            <button
              onClick={() => setTargetPopup(false)}
              className="mt-5 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black hover:bg-emerald-400"
            >
              Continue Trading
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          GLOBAL CSS
      ===================================================== */}

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: #26384d transparent;
        }

        body {
          background: #06101d;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #26384d;
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b192a] p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>

      <p
        className={`text-[10px] ${
          positive === true
            ? "text-emerald-400"
            : positive === false
            ? "text-red-400"
            : "text-slate-500"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}

/* =========================================================
   SMALL STAT
========================================================= */

function SmallStat({
  label,
  value,
  percent,
  positive,
  negative,
}: {
  label: string;
  value: string | number;
  percent?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b192a] p-3">
      <p className="text-[10px] text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-1">
        <p className="text-lg font-bold">
          {value}
        </p>

        {percent && (
          <span
            className={`text-[9px] ${
              positive
                ? "text-emerald-400"
                : negative
                ? "text-red-400"
                : "text-slate-500"
            }`}
          >
            {percent}
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RISK BOX
========================================================= */

function RiskBox({
  label,
  value,
  positive,
  extra,
}: {
  label: string;
  value: string;
  positive?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#071321] p-3">
      <p className="text-[9px] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-sm font-bold ${
          positive ? "text-emerald-400" : ""
        }`}
      >
        {value}
      </p>

      {extra}
    </div>
  );
}

/* =========================================================
   MOTIVATION
========================================================= */

function MotivationCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="relative min-h-[125px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17283e] to-[#08121f] p-5">
      <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

      <p className="text-[10px] font-bold tracking-[0.25em] text-blue-300">
        {title}
      </p>

      <p className="mt-3 max-w-xs font-serif italic text-lg leading-6 text-white">
        “{text}”
      </p>
    </div>
  );
}

/* =========================================================
   EQUITY CHART
========================================================= */

function EquityChart({
  data,
  target,
}: {
  data: EquityPoint[];
  target: number;
}) {
  const width = 900;
  const height = 270;

  const values = data.map((item) => item.value);

  const minValue = Math.min(
    ...values,
    target
  );

  const maxValue = Math.max(
    ...values,
    target
  );

  const range =
    maxValue - minValue === 0
      ? 1
      : maxValue - minValue;

  const points = data
    .map((item, index) => {
      const x =
        data.length === 1
          ? 20
          : 20 +
            (index / (data.length - 1)) *
              (width - 40);

      const y =
        height -
        25 -
        ((item.value - minValue) / range) *
          (height - 50);

      return `${x},${y}`;
    })
    .join(" ");

  const targetY =
    height -
    25 -
    ((target - minValue) / range) *
      (height - 50);

  return (
    <div className="relative h-[270px] w-full overflow-hidden rounded-xl border border-white/5 bg-[#071321]">
      <div className="absolute inset-0 opacity-30">
        {[25, 50, 75].map((value) => (
          <div
            key={value}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{
              top: `${value}%`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          x2={width}
          y1={targetY}
          y2={targetY}
          stroke="currentColor"
          className="text-blue-400/30"
          strokeDasharray="5 5"
        />

        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          className="text-emerald-400"
          strokeWidth="3"
        />

        {data.map((item, index) => {
          const x =
            data.length === 1
              ? 20
              : 20 +
                (index / (data.length - 1)) *
                  (width - 40);

          const y =
            height -
            25 -
            ((item.value - minValue) / range) *
              (height - 50);

          return (
            <circle
              key={`${item.date}-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              className="text-emerald-400"
            />
          );
        })}
      </svg>

      <div className="absolute right-3 top-3 rounded-lg border border-blue-400/10 bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
        Target {normalMoney(target)}
      </div>

      <div className="absolute bottom-2 left-3 text-[9px] text-slate-600">
        {data[0]?.date || ""}
      </div>

      <div className="absolute bottom-2 right-3 text-[9px] text-slate-600">
        {data[data.length - 1]?.date || ""}
      </div>
    </div>
  );
}