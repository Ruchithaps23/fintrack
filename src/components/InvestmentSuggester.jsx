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
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>
        {item.name}
      </div>
      <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 10 }}>
        {item.type}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>
        {item.pct}%
      </div>
      <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 2 }}>
        {fmt(monthlyAmount)}/mo
      </div>
      <div style={{ fontSize: 11, color: "#1D9E75", marginTop: 6, fontWeight: 600 }}>
        {item.ret}
      </div>
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 3,
        width: `${item.pct}%`,
        background: item.color,
        transition: "width 0.5s ease",
      }} />
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content: "You are a concise Indian personal finance advisor. Give practical, specific advice in 2-3 short sentences. Mention Indian instruments (SIP, PPF, FD, ELSS, NPS, etc.). Be warm and encouraging. No bullet points. No markdown.",
            },
            {
              role: "user",
              content: `My monthly savings: ${fmt(savings)}. Savings rate: ${rate}%. Risk appetite: ${riskLabel}. Proposed allocation: ${allocText}. Give me a quick personalised tip for this allocation.`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");

      const text = data.choices?.[0]?.message?.content || "Could not load advice.";
      setAdvice(text);
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
    <div style={{
      border: "1px solid #e0e0f0",
      borderRadius: 12,
      padding: "16px 18px",
      background: "#fff",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🤖 AI Advisor
        </span>
        <span style={{
          fontSize: 10,
          background: "#e6f4ec",
          color: "#1D9E75",
          padding: "2px 8px",
          borderRadius: 6,
          fontWeight: 600,
        }}>
          Groq powered
        </span>
      </div>

      <p style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: loading ? "#aaa" : noKey ? "#e05a5a" : "#1a1a2e",
        fontStyle: loading ? "italic" : "normal",
        minHeight: 48,
        margin: 0,
      }}>
        {loading ? "Getting personalised advice..." : advice}
      </p>

      {noKey && (
        <p style={{ fontSize: 12, color: "#7c6ff7", marginTop: 8, marginBottom: 0 }}>
          👉 Go to <strong>AI Assistant</strong> page and save your Groq API key there — it will work here automatically.
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
                type="number"
                value={val}
                step={1000}
                onChange={(e) => set(parseFloat(e.target.value) || 0)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  fontSize: 14,
                  border: "1px solid #e0e0f0",
                  borderRadius: 8,
                  outline: "none",
                  background: "#fafafa",
                }}
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
    </div>
  );
}