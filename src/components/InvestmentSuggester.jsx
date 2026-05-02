import { useState, useEffect, useCallback } from "react";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const PLANS = {
  low: [
    { name: "Fixed Deposit", type: "Bank FD", pct: 40, color: "#185FA5", ret: "6–7% p.a." },
    { name: "Public Provident Fund", type: "Govt scheme", pct: 30, color: "#0F6E56", ret: "7.1% p.a." },
    { name: "Debt Mutual Fund", type: "Low-risk MF", pct: 20, color: "#534AB7", ret: "6–8% p.a." },
    { name: "Liquid Fund", type: "Emergency buffer", pct: 10, color: "#888780", ret: "4–5% p.a." },
  ],
  mid: [
    { name: "Index SIP", type: "Nifty 50 / Sensex", pct: 35, color: "#185FA5", ret: "10–12% p.a." },
    { name: "Fixed Deposit", type: "Bank FD", pct: 25, color: "#0F6E56", ret: "6–7% p.a." },
    { name: "PPF", type: "Govt scheme", pct: 20, color: "#534AB7", ret: "7.1% p.a." },
    { name: "Gold ETF", type: "Hedge asset", pct: 20, color: "#BA7517", ret: "8–10% p.a." },
  ],
  high: [
    { name: "Equity SIP", type: "Mid & small cap", pct: 45, color: "#185FA5", ret: "14–18% p.a." },
    { name: "Direct Stocks", type: "Blue chip picks", pct: 25, color: "#D85A30", ret: "Variable" },
    { name: "ELSS Fund", type: "Tax saving MF", pct: 20, color: "#534AB7", ret: "12–15% p.a." },
    { name: "Gold ETF", type: "Hedge", pct: 10, color: "#BA7517", ret: "8–10% p.a." },
  ],
};

const RISK_LABELS = { low: "Conservative", mid: "Moderate", high: "Aggressive" };

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const LEARN_CONTENT = {
  "Fixed Deposit": {
    icon: "🏦", color: "#185FA5",
    tagline: "Safe, guaranteed returns from your bank",
    what: "A Fixed Deposit (FD) is a savings instrument where you deposit a lump sum with a bank for a fixed tenure at a predetermined interest rate. Your principal is completely safe and returns are guaranteed regardless of market conditions.",
    returns: "6–7% per annum, paid quarterly or on maturity. Senior citizens get an extra 0.25–0.5%.",
    risk: "Virtually zero. Deposits up to ₹5 lakhs are insured by DICGC (Deposit Insurance and Credit Guarantee Corporation).",
    howToStart: "Visit any bank's app or branch. Minimum deposit is as low as ₹1,000. Choose tenure from 7 days to 10 years. SBI, HDFC, ICICI, and Axis Bank all offer FDs online in under 5 minutes.",
    bestFor: "Emergency funds, short-term goals (1–3 years), risk-averse investors.",
    taxNote: "Interest earned is fully taxable as per your income slab. TDS is deducted if interest exceeds ₹40,000/year.",
  },
  "Public Provident Fund": {
    icon: "📋", color: "#0F6E56",
    tagline: "Government-backed, tax-free long-term savings",
    what: "PPF is a long-term savings scheme backed by the Government of India. It offers tax-free interest and the entire maturity amount is exempt from tax. It has a lock-in of 15 years, making it ideal for retirement planning.",
    returns: "7.1% per annum (reviewed quarterly by the government), compounded annually.",
    risk: "Zero — sovereign guarantee by the Government of India. One of the safest instruments available.",
    howToStart: "Open a PPF account at any post office or major bank (SBI, PNB, ICICI) online or offline. Minimum: ₹500/year. Maximum: ₹1.5 lakhs/year.",
    bestFor: "Long-term wealth building (10–15+ years), retirement corpus, tax saving under Section 80C.",
    taxNote: "Completely tax-free — investment, interest, and maturity all qualify under EEE (Exempt-Exempt-Exempt) status.",
  },
  "Debt Mutual Fund": {
    icon: "📊", color: "#534AB7",
    tagline: "Better than FD returns with low risk",
    what: "Debt mutual funds invest in bonds, government securities, and money market instruments. They aim to provide stable returns with lower risk than equity funds and are more liquid than FDs.",
    returns: "6–8% per annum depending on the fund type and interest rate environment.",
    risk: "Low to moderate. Risks include interest rate risk and credit risk. Choose funds with high-rated portfolios to minimise risk.",
    howToStart: "Invest through Groww, Zerodha Coin, or Paytm Money. No minimum lock-in. SIP possible from ₹500/month.",
    bestFor: "Investors in the 30% tax bracket, parking surplus for 1–3 years, capital preservation with slight growth.",
    taxNote: "Gains are taxed as per your income slab. No indexation benefit from FY2023 onwards.",
  },
  "Liquid Fund": {
    icon: "💧", color: "#888780",
    tagline: "Your smarter, higher-yield savings account",
    what: "Liquid funds invest in very short-term debt instruments (maturity up to 91 days) like treasury bills and commercial papers. They offer instant redemption and returns better than a savings account.",
    returns: "4–5% per annum — better than savings accounts (2.5–3.5%) with near-instant withdrawal.",
    risk: "Very low. Considered one of the safest mutual fund categories. NAV rarely falls.",
    howToStart: "Available on Groww, Kuvera, or any mutual fund platform. Redemption credited within 30 minutes to 1 business day. No exit load after 7 days.",
    bestFor: "Emergency funds, storing money between investments, accessible surplus cash.",
    taxNote: "Short-term gains taxed as per income slab. Gains after 3 years qualify for long-term capital gains.",
  },
  "Index SIP": {
    icon: "📈", color: "#185FA5",
    tagline: "Ride the Indian market with zero stock-picking stress",
    what: "An Index SIP invests a fixed monthly amount into a fund that mirrors the Nifty 50 or Sensex. You own a tiny piece of India's 50 largest companies — automatically diversified without any stock research needed.",
    returns: "10–12% per annum historically over 10+ year periods. Subject to market fluctuations short-term.",
    risk: "Moderate. Returns are market-linked. Short-term losses are possible but long-term wealth creation is well-established.",
    howToStart: "Start an SIP on Groww or Zerodha. Search 'Nifty 50 Index Fund'. Minimum SIP: ₹100/month. Set up auto-debit and stay consistent.",
    bestFor: "First-time equity investors, 5–10+ year goals like home purchase or retirement.",
    taxNote: "Gains above ₹1 lakh/year taxed at 10% (LTCG) if held over 1 year. Short-term gains taxed at 15%.",
  },
  "PPF": {
    icon: "📋", color: "#534AB7",
    tagline: "Government-backed, tax-free long-term savings",
    what: "PPF is a long-term savings scheme backed by the Government of India offering tax-free interest. With a 15-year lock-in, it is ideal for building a long-term retirement corpus with zero risk.",
    returns: "7.1% per annum (reviewed quarterly by government), compounded annually.",
    risk: "Zero — sovereign guarantee by the Government of India.",
    howToStart: "Open a PPF account at any post office or major bank online or offline. Minimum: ₹500/year. Maximum: ₹1.5 lakhs/year.",
    bestFor: "Long-term wealth building, retirement planning, tax saving under Section 80C.",
    taxNote: "Completely tax-free under EEE status — investment, interest, and maturity are all exempt.",
  },
  "Gold ETF": {
    icon: "✦", color: "#BA7517",
    tagline: "Own gold without the locker and making charges",
    what: "A Gold ETF lets you invest in gold electronically. Each unit represents 1 gram of 99.5% pure gold. You get all benefits of gold ownership without physical storage risks or making charges.",
    returns: "8–10% per annum historically. Gold typically rises when equity markets fall, providing portfolio balance.",
    risk: "Moderate. Gold prices fluctuate based on global demand, USD strength, and inflation. Considered a safe-haven asset.",
    howToStart: "Buy through any stockbroker app like Zerodha or Groww. You need a Demat account. Minimum: 1 unit (~₹600). No lock-in.",
    bestFor: "Portfolio diversification, hedging against inflation, 5–10 year wealth preservation.",
    taxNote: "Gains taxed as per income slab if sold within 3 years. After 3 years, 20% LTCG with indexation benefit applies.",
  },
  "Equity SIP": {
    icon: "🚀", color: "#185FA5",
    tagline: "High-growth investing in mid & small cap companies",
    what: "Equity SIPs in mid and small-cap funds invest in fast-growing companies outside the top 100 by market cap. A monthly SIP averages out your purchase price over time, reducing timing risk.",
    returns: "14–18% per annum over long periods (7+ years). Short-term swings of 20–40% are common.",
    risk: "High. These funds can fall sharply in bear markets. Only suitable if you can stay invested for 7–10+ years without panic-selling.",
    howToStart: "Start SIPs on Groww or Zerodha. Look for Axis Midcap, Nippon India Small Cap. Minimum ₹500/month. Set up auto-debit.",
    bestFor: "Long-term wealth creation (10+ years), young investors with high risk tolerance.",
    taxNote: "Gains above ₹1 lakh/year taxed at 10% LTCG if held over 1 year. Short-term gains at 15%.",
  },
  "Direct Stocks": {
    icon: "📉", color: "#D85A30",
    tagline: "Own shares of India's best companies directly",
    what: "Buying direct stocks means purchasing shares of individual companies listed on NSE or BSE. You become a part-owner of the business and profit when the company grows. Requires more research than mutual funds.",
    returns: "Variable — blue-chip stocks like TCS, Infosys, Reliance have historically delivered 12–15% CAGR. Individual stocks can far exceed or underperform this.",
    risk: "High. Individual stocks can underperform or go to zero. Diversification across 10–15 stocks reduces risk significantly.",
    howToStart: "Open a Demat + trading account on Zerodha, Groww, or Angel One (free). Start with 4–5 blue-chip companies you understand. Invest monthly.",
    bestFor: "Investors who enjoy research, have time to monitor portfolios, and can tolerate short-term volatility.",
    taxNote: "Short-term gains (under 1 year) at 15%. Long-term gains above ₹1 lakh at 10%. Dividends taxed as income.",
  },
  "ELSS Fund": {
    icon: "🛡", color: "#534AB7",
    tagline: "Save tax and grow wealth at the same time",
    what: "ELSS (Equity Linked Savings Scheme) is a mutual fund that invests in equities and qualifies for tax deduction under Section 80C. It has the shortest lock-in (3 years) among all 80C options and offers market-linked returns.",
    returns: "12–15% per annum historically over 5+ year periods.",
    risk: "Moderate to high — linked to equity markets. The 3-year lock-in actually helps by preventing panic withdrawals during downturns.",
    howToStart: "Invest via Groww or Zerodha. Top funds: Mirae Asset Tax Saver, Quant Tax Plan, Axis Long Term Equity. SIP from ₹500/month.",
    bestFor: "Salaried individuals wanting to save tax under 80C (up to ₹1.5 lakhs deduction), investors with 5+ year horizon.",
    taxNote: "Investment deductible up to ₹1.5 lakhs under Section 80C. Gains after 3-year lock-in taxed at 10% LTCG above ₹1 lakh.",
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function MetricCard({ label, value, highlight }) {
  return (
    <div style={{ background: "#f5f5ff", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? "#1D9E75" : "#1a1a2e" }}>
        {value}
      </div>
    </div>
  );
}

function RiskButton({ id, label, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        flex: 1,
        padding: "9px 4px",
        border: active ? "1.5px solid #7c6ff7" : "1px solid #e0e0f0",
        borderRadius: 10,
        background: active ? "#7c6ff7" : "transparent",
        color: active ? "#fff" : "#6b6b8a",
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function InvestmentCard({ item, monthlyAmount }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e0e0f0",
      borderRadius: 12,
      padding: "14px 16px",
      position: "relative",
      overflow: "hidden",
      flex: "1 1 140px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{item.name}</div>
      <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 10 }}>{item.type}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{item.pct}%</div>
      <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 2 }}>{fmt(monthlyAmount)}/mo</div>
      <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 6, fontWeight: 600 }}>{item.ret}</div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, height: 3,
        width: `${item.pct}%`, background: item.color, transition: "width 0.5s ease",
      }} />
    </div>
  );
}

function LearnSection({ plan }) {
  const [openIndex, setOpenIndex] = useState(0);

  const items = plan
    .map((p) => LEARN_CONTENT[p.name])
    .filter(Boolean);

  const planNames = plan.map((p) => p.name);

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e0e0f0",
      borderRadius: 12,
      marginTop: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid #f0f0f8",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: 15 }}>📚</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Learn about your investments</span>
        <span style={{
          fontSize: 10, background: "#f5f5ff", color: "#7c6ff7",
          padding: "2px 8px", borderRadius: 6, fontWeight: 600, marginLeft: "auto",
        }}>
          {items.length} instruments
        </span>
      </div>

      {/* Tab row */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        borderBottom: "1px solid #f0f0f8",
        padding: "0 18px",
        gap: 4,
      }}>
        {planNames.map((name, i) => {
          const info = LEARN_CONTENT[name];
          if (!info) return null;
          return (
            <button
              key={name}
              onClick={() => setOpenIndex(i)}
              style={{
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: openIndex === i ? 700 : 500,
                color: openIndex === i ? "#7c6ff7" : "#6b6b8a",
                background: "transparent",
                border: "none",
                borderBottom: openIndex === i ? "2px solid #7c6ff7" : "2px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {info.icon} {name}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {(() => {
        const name = planNames[openIndex];
        const info = LEARN_CONTENT[name];
        if (!info) return null;
        return (
          <div style={{ padding: "20px 18px" }}>
            {/* Tagline */}
            <div style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: info.color,
              background: info.color + "18",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 14,
            }}>
              {info.tagline}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "📖 What is it?", text: info.what },
                { label: "📈 Expected returns", text: info.returns },
                { label: "⚠️ Risk level", text: info.risk },
                { label: "🚀 How to get started", text: info.howToStart },
                { label: "🎯 Best for", text: info.bestFor },
                { label: "🧾 Tax implications", text: info.taxNote },
              ].map(({ label, text }) => (
                <div
                  key={label}
                  style={{
                    background: "#fafafa",
                    border: "1px solid #f0f0f8",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: "#1a1a2e", lineHeight: 1.6 }}>
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AIAdvice({ savings, rate, risk, plan }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);

  const fetchAdvice = useCallback(async () => {
    const apiKey = localStorage.getItem("groq_key");
    if (!apiKey) {
      setNoKey(true);
      setAdvice("No Groq API key found.");
      return;
    }
    setNoKey(false);
    if (savings <= 0) {
      setAdvice("Your expenses currently exceed your income. Try reducing expenses to unlock investment suggestions.");
      return;
    }
    setLoading(true);
    setAdvice("");
    const riskLabel = { low: "conservative", mid: "moderate", high: "aggressive" }[risk];
    const allocText = plan.map((p) => `${p.name} (${p.pct}%)`).join(", ");
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 200,
          messages: [
            { role: "system", content: "You are a concise Indian personal finance advisor. Give practical, specific advice in 2-3 short sentences. Mention Indian instruments (SIP, PPF, FD, ELSS, NPS, etc.). Be warm and encouraging. No bullet points. No markdown." },
            { role: "user", content: `My monthly savings: ${fmt(savings)}. Savings rate: ${rate}%. Risk appetite: ${riskLabel}. Proposed allocation: ${allocText}. Give me a quick personalised tip.` },
          ],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");
      setAdvice(data.choices?.[0]?.message?.content || "Could not load advice.");
    } catch (err) {
      setAdvice(`Error: ${err.message}. Please check your Groq API key in the AI Assistant page.`);
    } finally {
      setLoading(false);
    }
  }, [savings, rate, risk, plan]);

  useEffect(() => {
    const timer = setTimeout(fetchAdvice, 600);
    return () => clearTimeout(timer);
  }, [fetchAdvice]);

  return (
    <div style={{ border: "1px solid #e0e0f0", borderRadius: 12, padding: "16px 18px", background: "#fff", marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🤖 AI Advisor
        </span>
        <span style={{ fontSize: 10, background: "#e6f4ec", color: "#1D9E75", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
          Groq powered
        </span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: loading ? "#aaa" : noKey ? "#e05a5a" : "#1a1a2e", fontStyle: loading ? "italic" : "normal", minHeight: 48, margin: 0 }}>
        {loading ? "Getting personalised advice..." : advice}
      </p>
      {noKey && (
        <p style={{ fontSize: 12, color: "#7c6ff7", marginTop: 8, marginBottom: 0 }}>
          👉 Go to <strong>AI Assistant</strong> page and save your Groq API key — it will work here automatically.
        </p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function InvestmentSuggester({ totalIncome, totalExpenses }) {
  const hasProps = totalIncome !== undefined && totalExpenses !== undefined;
  const [income, setIncome] = useState(totalIncome ?? 50000);
  const [expenses, setExpenses] = useState(totalExpenses ?? 32000);
  const [risk, setRisk] = useState("mid");

  useEffect(() => { if (totalIncome !== undefined) setIncome(totalIncome); }, [totalIncome]);
  useEffect(() => { if (totalExpenses !== undefined) setExpenses(totalExpenses); }, [totalExpenses]);

  const savings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const plan = PLANS[risk];

  return (
    <div style={{ fontFamily: "inherit", maxWidth: 700, margin: "0 auto" }}>

      {!hasProps && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Monthly income (₹)", val: income, set: setIncome },
            { label: "Monthly expenses (₹)", val: expenses, set: setExpenses },
          ].map(({ label, val, set }) => (
            <div key={label} style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#6b6b8a", display: "block", marginBottom: 4 }}>{label}</label>
              <input
                type="number" value={val} step={1000}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1px solid #e0e0f0", borderRadius: 8, outline: "none", background: "#fafafa" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        <MetricCard label="Monthly savings" value={fmt(savings)} highlight />
        <MetricCard label="Savings rate" value={`${savingsRate}%`} />
        <MetricCard label="Yearly savings" value={fmt(savings * 12)} />
      </div>

      {/* Risk selector */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        Risk appetite
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {Object.entries(RISK_LABELS).map(([id, label]) => (
          <RiskButton key={id} id={id} label={label} active={risk === id} onClick={setRisk} />
        ))}
      </div>

      {/* Allocation cards */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Recommended allocation
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
        {plan.map((item) => (
          <InvestmentCard key={item.name} item={item} monthlyAmount={(savings * item.pct) / 100} />
        ))}
      </div>

      {/* AI advice */}
      <AIAdvice savings={savings} rate={savingsRate} risk={risk} plan={plan} />

      {/* Learn section */}
      <LearnSection plan={plan} />
    </div>
  );
}