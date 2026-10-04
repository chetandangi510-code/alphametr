'use client'

import { useState } from 'react'
import MarketTicker from '@/components/shared/MarketTicker'
import SentimentMeter from '@/components/shared/SentimentMeter'
import AuthModal from '@/components/shared/AuthModal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)

  function openModal() {
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#061426] text-[#eaf2ff] selection:bg-cyan-400/30">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-[#061426]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-end justify-center gap-0.5 rounded-lg bg-cyan-400/10 p-1.5 text-cyan-300">
              <span className="h-3 w-1.5 rounded-t bg-cyan-400" />
              <span className="h-5 w-1.5 rounded-t bg-cyan-300" />
              <span className="h-7 w-1.5 rounded-t bg-blue-400" />
            </div>
            <div>
              <div className="text-[19px] font-bold leading-none tracking-tight">AlphaMetrics</div>
              <div className="mt-1 text-[9px] text-[#8ea4c2]">Trade Smart · Build Consistency · Create Freedom</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-[#8ea4c2] md:flex">
            <span className="border-b-2 border-cyan-400 pb-2 text-cyan-300">Home</span>
            <span className="transition hover:text-white">Features</span>
            <span className="transition hover:text-white">How It Works</span>
            <span className="transition hover:text-white">About</span>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={openModal} className="rounded-lg border border-blue-400/50 px-4 py-2 text-sm font-semibold transition hover:border-cyan-300 hover:text-cyan-200">
              Login
            </button>
            <button onClick={openModal} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.25)] transition hover:bg-blue-400">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO (with hand-drawn SVG mountain + candlestick visual)
      ========================================================= */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Small Steps.<br /><span className="text-cyan-400">Big Results.</span>
          </h1>
          <p className="mt-3 text-base font-semibold md:text-lg">Discipline • Patience • Consistency</p>
          <p className="mt-3 text-sm italic text-[#c5d3e5]">&ldquo;Discipline is the bridge between your goals and your success.&rdquo;</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#a9bad0]">
            Track your trades, understand your performance, and build better trading habits with AlphaMetrics.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={openModal} className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold shadow-[0_0_25px_rgba(59,130,246,0.30)] transition hover:bg-blue-400">
              🚀 Get Started Free →
            </button>
            <button className="rounded-lg border border-blue-400/60 bg-[#071a31]/50 px-5 py-3 text-sm font-semibold transition hover:border-cyan-300 hover:text-cyan-200">
              ✨ Explore Features
            </button>
            <button onClick={openModal} className="rounded-lg border border-blue-400/70 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/10">
              🔐 Login
            </button>
          </div>
        </div>

        <div className="h-72 overflow-hidden rounded-2xl border border-[#1e2f4d] bg-gradient-to-b from-[#1e2a4a] via-[#2a2140] to-[#0a1120]">
          <svg viewBox="0 0 500 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <circle cx="395" cy="70" r="60" fill="#f5a623" opacity="0.18" />
            <circle cx="395" cy="70" r="34" fill="#f7b955" opacity="0.95" />
            <polygon points="0,280 60,150 140,280" fill="#1a2847" opacity="0.7" />
            <polygon points="340,280 420,140 500,280" fill="#1a2847" opacity="0.7" />
            <polygon points="0,280 110,110 230,280" fill="#101d38" opacity="0.9" />
            <polygon points="260,280 380,120 500,280" fill="#101d38" opacity="0.9" />
            <polygon points="130,280 250,70 370,280" fill="#0a1120" />
            <g transform="translate(250,100)">
              <circle cx="0" cy="0" r="5" fill="#000" />
              <path d="M0,5 L0,22 M0,10 L-8,20 M0,10 L9,17 M0,22 L-7,38 M0,22 L7,38" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
            {[
              [15,190,30,'#22c55e'],[35,205,18,'#ef4444'],[55,175,42,'#22c55e'],[75,195,25,'#ef4444'],
              [95,160,55,'#22c55e'],[115,180,35,'#ef4444'],[420,185,32,'#22c55e'],[440,200,20,'#ef4444'],
              [460,165,48,'#22c55e'],[480,190,28,'#ef4444'],
            ].map(([x,y,h,color],i) => (
              <g key={i} opacity="0.55">
                <line x1={(x as number)+3} y1={(y as number)-8} x2={(x as number)+3} y2={(y as number)+(h as number)+8} stroke={color as string} strokeWidth="1.5" />
                <rect x={x as number} y={y as number} width="7" height={h as number} fill={color as string} rx="1" />
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* Live market ticker */}
      <div className="mx-auto max-w-6xl px-5"><MarketTicker /></div>

      {/* =========================================================
          WHAT IS ALPHAMETRICS
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-5 md:py-6">
        <div className="mx-auto grid max-w-6xl gap-0 overflow-hidden rounded-xl border border-blue-400/30 bg-[#071a31]/80 md:grid-cols-[1.45fr_1fr]">
          <div className="flex gap-4 p-6">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">📈</div>
            <div>
              <h2 className="text-xl font-bold">What is AlphaMetrics?</h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-[#91a8c5]">
                AlphaMetrics is a personal trading journal and analytics platform designed to help traders record their
                trades, calculate profit and loss, understand trading behavior, and improve their decision-making through data.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-blue-400/20 md:border-l md:border-t-0">
            {[
              ['📒', 'Track Your Trades', 'Keep detailed records of every trade.'],
              ['📊', 'Analyze Performance', 'Get automatic statistics and insights.'],
              ['🛡️', 'Manage Risk', 'Stay within your limits and trade smarter.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="border-l border-blue-400/15 p-4 first:border-l-0">
                <div className="mb-2 text-2xl">{icon}</div>
                <b className="text-[11px]">{title}</b>
                <p className="mt-1 text-[9px] leading-4 text-[#8098b8]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          KEY FEATURES
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Key Features</h2>
            <p className="mt-1 text-xs text-[#8fa6c2]">Everything you need to become a better trader.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              ['📒', 'Smart Trading Journal', 'Record and manage your trades using an Excel-like editable journal with flexible rows and detailed trade information.'],
              ['📊', 'Automated Analytics', 'Track Win Rate, Total P/L, Equity Curve, Risk-Reward Ratio, and trading performance automatically.'],
              ['🛡️', 'Risk Management', 'Monitor risk per trade, daily loss, and drawdown limits with clear alerts and tracking tools.'],
              ['🧠', 'Behavior Insights', 'Analyze your trading habits, mistakes, emotions, and recurring patterns using your trade data.'],
              ['📄', 'Reports & Export', 'Generate PDF reports and export your trading journal data whenever needed.'],
              ['🎯', 'Strategy Tracker', 'Organize your strategies, setups, confirmations, lessons, and personal improvement notes.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="group rounded-xl border border-blue-400/25 bg-[#071a31]/75 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 text-xl">{icon}</div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#8fa6c2]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
            <p className="mt-1 text-xs text-[#8fa6c2]">Get started in 3 simple steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['1', 'Create Your Account', 'Sign up and set up your personal trading journal.'],
              ['2', 'Record Your Trades', 'Enter your trade details, risk, entry, exit, result, and chart links.'],
              ['3', 'Analyze & Improve', 'Review your statistics, identify mistakes, and improve your discipline.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="relative text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400 bg-[#061426] text-lg font-bold text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                  {num}
                </div>
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-[#8fa6c2]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market sentiment dashboard preview */}
      <SentimentMeter />

      {/* =========================================================
          YOUR TRADING JOURNAL, SIMPLIFIED
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 md:grid-cols-[1.3fr_1fr]">
          <div className="flex h-56 items-center justify-center rounded-xl border border-[#1e2f4d] bg-[#0f1a2e] text-sm text-[#8aa0bf]">
            🖥️ Dashboard + Journal preview (screenshot once you have real data)
          </div>
          <div>
            <h2 className="mb-2 text-2xl font-bold">Your Trading Journal, Simplified.</h2>
            <p className="mb-4 text-sm text-[#8fa6c2]">
              Manage your trades, review your performance, and understand your trading journey in one organized workspace.
            </p>
            <ul className="mb-5 space-y-2 text-sm">
              {['Editable Excel-like trading table', 'View TradingView chart links & images', 'Automatic statistics & analytics', 'Save changes anytime (auto-sync)'].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="text-green-400">✔</span>{item}</li>
              ))}
            </ul>
            <button onClick={openModal} className="rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">
              Explore Dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHO IS IT FOR + DISCLAIMER
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Who Is AlphaMetrics For?</h2>
            <p className="mt-1 text-xs text-[#8fa6c2]">Built for every trader, at every level.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['💱', 'Forex Traders', 'Record and review Forex trades with structured journal data.'],
              ['🪙', 'Crypto & Stock Traders', 'Organize trading performance across different markets.'],
              ['🏆', 'Prop-Firm Challenge Traders', 'Track your personal risk limits and performance.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="rounded-xl border border-blue-400/25 bg-[#071a31]/75 p-5 text-center">
                <div className="mb-2 text-2xl">{icon}</div>
                <b className="text-sm">{title}</b>
                <p className="mt-1 text-xs leading-5 text-[#8fa6c2]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-amber-400/70 bg-amber-400/10 p-4 text-xs text-amber-200">
            <b>⚠️ Important Disclaimer</b>
            <p className="mt-1 leading-5">
              AlphaMetrics is designed for educational purposes, trading journaling, and personal self-analysis only.
              It does not execute real trades, connect directly to brokers or user funds, or provide financial advice.
              Users are responsible for their own trading decisions.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="border-b border-cyan-400/10 py-12 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-2xl font-bold md:text-3xl">Start Building Better Trading Habits Today.</h2>
          <p className="mt-1 text-xs text-[#a9bad0]">Track your trades. Learn from your data. Improve your consistency.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={openModal} className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold hover:bg-blue-400">
              🚀 Create Free Account →
            </button>
            <button onClick={openModal} className="rounded-lg border border-blue-400/60 px-5 py-3 text-sm font-semibold hover:border-cyan-300">
              🔐 Already have an account? Login
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 text-xs text-[#7890ad] md:flex-row">
          <div>
            <div className="text-sm font-bold text-white">📈 AlphaMetrics</div>
            <div className="mt-1 text-[9px]">Trade Smart · Build Consistency · Create Freedom</div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <span>Home</span><span>Features</span><span>About</span><span>Contact</span>
            <button onClick={openModal} className="hover:text-white">Login</button>
            <button onClick={openModal} className="hover:text-white">Sign Up</button>
          </div>
          <div className="text-center md:text-right">
            © 2026 AlphaMetrics. All rights reserved.<br />
            <span className="underline">Privacy Policy</span> · <span className="underline">Terms of Service</span> · <span className="underline">Disclaimer</span>
          </div>
        </div>
      </footer>

      {/* =========================================================
          LOGIN / SIGNUP MODAL
      ========================================================= */}
      {modalOpen && <AuthModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}