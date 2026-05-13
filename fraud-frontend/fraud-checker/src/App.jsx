import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

// ─── Sample Transactions ───────────────────────────────────────────────────
// Real-world inspired values based on the creditcard dataset patterns.
// V1–V28 are PCA-transformed features. Amount is in USD.

const SAMPLES = [
  {
    id: "normal-grocery",
    name: "Grocery Store Purchase",
    badge: "safe",
    desc: "A typical everyday grocery run of $45.23. Normal spending pattern — low-risk.",
    amount: "45.23",
    expectedFraud: false,
    values: {
      V1: "-1.3598", V2: "-0.0728", V3: "2.5363",  V4: "1.3782",
      V5: "-0.3383", V6: "0.4624",  V7: "0.2396",  V8: "0.0987",
      V9: "0.3638",  V10: "0.0908", V11: "-0.5516", V12: "-0.6178",
      V13: "-0.9913", V14: "-0.3111", V15: "1.4681", V16: "-0.4704",
      V17: "0.2079",  V18: "0.0258",  V19: "0.4034", V20: "0.2514",
      V21: "-0.0183", V22: "0.2778",  V23: "-0.1104", V24: "0.0669",
      V25: "0.1285",  V26: "-0.1891", V27: "0.1336",  V28: "-0.0210",
    },
  },
  {
    id: "suspicious-online",
    name: "High-Value Online Transfer",
    badge: "medium",
    desc: "A large online transfer of $2,149.99 — elevated amount outside normal behaviour.",
    amount: "2149.99",
    expectedFraud: false,
    values: {
      V1: "-2.3122", V2: "1.9519",  V3: "-1.6097", V4: "3.9979",
      V5: "-0.5222", V6: "1.7260",  V7: "-0.7867", V8: "0.3145",
      V9: "-1.3195", V10: "-2.2423", V11: "0.4866",  V12: "-2.1153",
      V13: "0.5961",  V14: "-0.3943", V15: "0.8891",  V16: "-0.9478",
      V17: "-3.5534", V18: "-1.8434", V19: "0.2200",  V20: "0.6048",
      V21: "0.4399",  V22: "-0.6229", V23: "-0.2432", V24: "-0.1965",
      V25: "0.6684",  V26: "0.1285",  V27: "-0.5613", V28: "0.0234",
    },
  },
  {
    id: "fraud-pattern",
    name: "Suspected Fraudulent Card Use",
    badge: "fraud",
    desc: "This pattern closely matches known fraudulent transactions in the training data.",
    amount: "1.00",
    expectedFraud: true,
    values: {
      V1: "-3.0435", V2: "2.0891",  V3: "-3.7488", V4: "1.9956",
      V5: "-1.6027", V6: "2.3620",  V7: "-2.8900", V8: "0.5010",
      V9: "-1.5975", V10: "-4.5898", V11: "2.0421",  V12: "-5.7321",
      V13: "1.0272",  V14: "-4.4869", V15: "0.6188",  V16: "-3.5945",
      V17: "-8.1683", V18: "-2.8296", V19: "-0.3153", V20: "0.4453",
      V21: "0.4598",  V22: "-0.4037", V23: "-0.3558", V24: "-0.1371",
      V25: "0.2510",  V26: "-0.0742", V27: "0.4512",  V28: "0.3027",
    },
  },
  {
    id: "normal-restaurant",
    name: "Restaurant Dining",
    badge: "safe",
    desc: "A $78.50 dinner at a local restaurant — perfectly normal transaction.",
    amount: "78.50",
    expectedFraud: false,
    values: {
      V1: "1.1919",  V2: "0.2662",  V3: "0.1664",  V4: "0.4487",
      V5: "-0.0184", V6: "-0.3545", V7: "0.0756",  V8: "0.0328",
      V9: "-0.1600", V10: "-0.0897", V11: "-0.1536", V12: "0.2278",
      V13: "0.0124",  V14: "0.1412",  V15: "0.8025",  V16: "0.0050",
      V17: "-0.2454", V18: "0.1078",  V19: "-0.1289", V20: "-0.0328",
      V21: "-0.0298", V22: "-0.0255", V23: "-0.0102", V24: "-0.0286",
      V25: "0.0220",  V26: "0.0127",  V27: "0.0018",  V28: "0.0086",
    },
  },
];

const BLANK_V = Object.fromEntries(
  Array.from({ length: 28 }, (_, i) => [`V${i + 1}`, ""])
);

const INITIAL = { Amount: "", ...BLANK_V };

// ─── Helpers ───────────────────────────────────────────────────────────────

function riskLevel(score) {
  if (score < 0.3) return "safe";
  if (score < 0.65) return "medium";
  return "fraud";
}

function gaugeClass(score) {
  const r = riskLevel(score);
  return r === "safe" ? "safe-fill" : r === "medium" ? "warn-fill" : "fraud-fill";
}

function verdictText(isFraudulent, score) {
  if (isFraudulent) return "⚠️ Fraud Detected";
  if (score >= 0.3)  return "🟡 Elevated Risk";
  return "✅ Transaction Safe";
}

function adviceText(isFraudulent, score) {
  if (isFraudulent)
    return "🚨 This transaction has been flagged as highly suspicious. We recommend blocking the card and contacting the cardholder immediately.";
  if (score >= 0.3)
    return "⚠️ This transaction shows some unusual patterns. Consider sending a verification SMS to the cardholder before processing.";
  return "✅ This transaction looks normal. No action required — it can be safely approved.";
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function App() {
  const [input, setInput]   = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const formRef = useRef(null);

  const handleChange = (e) =>
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const loadSample = (sample) => {
    setInput({ Amount: sample.amount, ...sample.values });
    setResult(null);
    setError(null);
    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Convert all values to floats before sending
    const payload = {};
    for (const key in input) {
      const val = parseFloat(input[key]);
      if (isNaN(val)) {
        setError(`⚠️ "${key}" has an invalid value. Please make sure all fields contain numbers.`);
        setLoading(false);
        return;
      }
      payload[key] = val;
    }

    try {
      const res = await axios.post("http://localhost:5001/predict", payload);
      setResult(res.data);
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("🔌 Cannot reach the AI server. Make sure you have started the Python server by running: python3 app.py in the fraud-Backend folder.");
      } else {
        setError(`Something went wrong: ${err.response?.data?.error || err.message}`);
      }
    }
    setLoading(false);
  };

  const vFeatures = Array.from({ length: 28 }, (_, i) => `V${i + 1}`);

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="shield-icon">🛡️</div>
          FraudGuard AI
        </div>
        <span className="navbar-badge">ML Powered</span>
      </nav>

      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-tag">🤖 Machine Learning · Real-Time Analysis</div>
        <h1 className="hero-title">
          Detect Credit Card<br />Fraud Instantly
        </h1>
        <p className="hero-subtitle">
          Enter transaction data and our AI model — trained on 284,000+ real
          transactions — will tell you within seconds whether a payment is safe
          or suspicious.
        </p>
        <a className="hero-cta" href="#analyser">
          Try It Now →
        </a>
      </header>

      {/* ── Stats ── */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">284K+</div>
          <div className="stat-label">Training Transactions</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">100</div>
          <div className="stat-label">Decision Trees</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">28</div>
          <div className="stat-label">AI Features Analysed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">&lt;1s</div>
          <div className="stat-label">Prediction Time</div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="section">
        <div className="section-title">How It Works</div>
        <div className="section-sub">Three simple steps to check any transaction</div>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-step">1</div>
            <h3>Load a Sample or Enter Data</h3>
            <p>
              Use one of the ready-made sample transactions below, or manually
              enter the transaction amount and the 28 encoded feature values
              (V1–V28).
            </p>
          </div>
          <div className="how-card">
            <div className="how-step">2</div>
            <h3>Click "Analyse Transaction"</h3>
            <p>
              Your data is sent to the AI server running locally. A Random
              Forest model — trained on real credit card data — evaluates the
              pattern in under a second.
            </p>
          </div>
          <div className="how-card">
            <div className="how-step">3</div>
            <h3>Read the Result</h3>
            <p>
              You get an instant verdict: ✅ Safe, 🟡 Elevated Risk, or 🚨 Fraud
              Detected — along with a fraud score from 0 (safe) to 1 (certain
              fraud) and recommended action.
            </p>
          </div>
          <div className="how-card">
            <div className="how-step">?</div>
            <h3>What Are V1–V28?</h3>
            <p>
              These are privacy-protected features. Real transaction details
              (merchant, location, etc.) were transformed using PCA — a math
              technique that hides sensitive data while keeping the patterns the
              AI needs to detect fraud.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sample Transactions ── */}
      <section className="sample-section">
        <div className="section">
          <div className="section-title">Try with Sample Transactions</div>
          <div className="section-sub">
            Click any card to instantly load real-world-inspired data into the
            form below — then hit Analyse to see the AI in action.
          </div>
          <div className="samples-grid">
            {SAMPLES.map((s) => (
              <div
                key={s.id}
                className={`sample-card ${s.badge === "safe" ? "safe-sample" : s.badge === "fraud" ? "fraud-sample" : ""}`}
              >
                <div className="sample-header">
                  <span className="sample-name">{s.name}</span>
                  <span className={`sample-badge ${s.badge}`}>
                    {s.badge === "safe" ? "✅ Safe" : s.badge === "fraud" ? "🚨 Fraud" : "⚠️ Medium"}
                  </span>
                </div>
                <p className="sample-desc">{s.desc}</p>
                <div className="sample-amount">${s.amount}</div>
                <button
                  id={`sample-btn-${s.id}`}
                  className="sample-use-btn"
                  onClick={() => loadSample(s)}
                >
                  Load this transaction →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analyser ── */}
      <section className="analyser-section section" id="analyser" ref={formRef}>
        <div className="section-title">Transaction Analyser</div>
        <div className="section-sub">
          Fill in the transaction details below and click Analyse. All 29 fields
          are required. Use the samples above to get started quickly.
        </div>

        <div className="analyser-layout">
          {/* ── Left: Form ── */}
          <div className="analyser-form-card">
            <form id="transaction-form" onSubmit={handleSubmit}>
              <div className="form-section-label">💳 Transaction Amount</div>
              <div className="amount-input-wrap">
                <span className="amount-prefix">$</span>
                <input
                  id="input-Amount"
                  className="amount-input"
                  type="number"
                  name="Amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={input.Amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-section-label">🔢 Encoded Feature Values (V1 – V28)</div>
              <div className="pca-info-box">
                <strong>What are these?</strong> V1–V28 are PCA-encoded transaction
                features. They represent hidden details like merchant category,
                location, and spending pattern — mathematically transformed to
                protect privacy. Use the sample cards above to auto-fill these.
              </div>

              <div className="v-grid">
                {vFeatures.map((key) => (
                  <div className="v-field" key={key}>
                    <label htmlFor={`input-${key}`}>{key}</label>
                    <input
                      id={`input-${key}`}
                      type="number"
                      name={key}
                      step="any"
                      placeholder="0.0"
                      value={input[key]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                id="analyse-btn"
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" />Analysing…</>
                ) : (
                  "🔍 Analyse Transaction"
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div id="error-box" className="error-box" style={{ marginTop: "1rem" }}>
                {error}
              </div>
            )}
          </div>

          {/* ── Right: Guide + Result ── */}
          <div className="right-panel">
            {/* Field guide */}
            <div className="guide-card">
              <h3>📖 Quick Reference</h3>
              <div className="guide-item">
                <span className="guide-key">Amount</span>
                <span className="guide-val">
                  The transaction value in USD. Can range from a few cents (test
                  transactions often used by fraudsters) to thousands.
                </span>
              </div>
              <div className="guide-item">
                <span className="guide-key">V1–V28</span>
                <span className="guide-val">
                  28 PCA-transformed features derived from the raw transaction
                  record. Values are typically in the range –10 to +10.
                </span>
              </div>
              <div className="guide-item">
                <span className="guide-key">Score</span>
                <span className="guide-val">
                  Output from 0.0 to 1.0. Under 0.3 = safe, 0.3–0.65 = review,
                  above 0.65 = likely fraud.
                </span>
              </div>
            </div>

            {/* Result */}
            {result && !error && (() => {
              const score = result.fraudScore;
              const isFraud = result.isFraudulent;
              const risk = riskLevel(score);
              const pct = Math.round(score * 100);

              return (
                <div id="result-panel" className="result-card">
                  <div className={`result-header ${isFraud ? "fraud-result" : "safe-result"}`}>
                    <div className="result-icon">
                      {isFraud ? "🚨" : score >= 0.3 ? "⚠️" : "✅"}
                    </div>
                    <div>
                      <div className={`result-verdict ${isFraud ? "fraud-text" : "safe-text"}`}>
                        {verdictText(isFraud, score)}
                      </div>
                      <div className="result-sub">
                        AI confidence based on 100-tree Random Forest
                      </div>
                    </div>
                  </div>

                  <div className="result-body">
                    <div className="gauge-wrap">
                      <div className="gauge-label">
                        <span>Fraud Risk Score</span>
                        <span style={{ color: isFraud ? "var(--danger)" : score >= 0.3 ? "var(--warn)" : "var(--safe)" }}>
                          {score.toFixed(4)} ({pct}%)
                        </span>
                      </div>
                      <div className="gauge-bar">
                        <div
                          className={`gauge-fill ${gaugeClass(score)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="result-meta">
                      <div className="meta-item">
                        <div className="meta-label">Is Fraudulent</div>
                        <div
                          className="meta-value"
                          style={{ color: isFraud ? "var(--danger)" : "var(--safe)" }}
                        >
                          {isFraud ? "Yes 🚨" : "No ✅"}
                        </div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Risk Level</div>
                        <div
                          className="meta-value"
                          style={{
                            color:
                              risk === "fraud" ? "var(--danger)" :
                              risk === "medium" ? "var(--warn)" : "var(--safe)",
                          }}
                        >
                          {risk === "fraud" ? "High 🔴" : risk === "medium" ? "Medium 🟡" : "Low 🟢"}
                        </div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Fraud Score</div>
                        <div className="meta-value">{score.toFixed(4)}</div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Model</div>
                        <div className="meta-value" style={{ fontSize: "0.78rem" }}>
                          Random Forest (100 trees)
                        </div>
                      </div>
                    </div>

                    <div
                      className={`result-advice ${
                        isFraud ? "fraud-advice" : score >= 0.3 ? "warn-advice" : "safe-advice"
                      }`}
                    >
                      {adviceText(isFraud, score)}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Placeholder before first result */}
            {!result && !error && (
              <div className="guide-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>🔍</div>
                <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>No result yet</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Load a sample transaction or fill in the form, then click
                  "Analyse Transaction" to see the AI verdict here.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="section">
          <div className="section-title">Frequently Asked Questions</div>
          <div className="section-sub" style={{ marginBottom: "2rem" }}>
            Answers to common questions about how the system works
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Why does the fraud score vary even for safe-looking transactions?</h4>
              <p>
                The model was trained on real data where even normal transactions
                occasionally share features with fraudulent ones. A score under
                0.3 is considered safe.
              </p>
            </div>
            <div className="faq-item">
              <h4>Where does the training data come from?</h4>
              <p>
                The <code>creditcard.csv</code> dataset is a publicly available
                dataset of European credit card transactions from 2013, containing
                284,807 transactions and 492 fraud cases.
              </p>
            </div>
            <div className="faq-item">
              <h4>What is a Random Forest?</h4>
              <p>
                It's an ensemble of 100 decision trees. Each tree votes on
                whether a transaction is fraud, and the final answer is the
                majority vote — making it very robust.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I run this on real live transactions?</h4>
              <p>
                This is a demonstration system using a standard dataset. To
                use it in production, you'd need to generate live PCA features
                from your payment processor's raw data.
              </p>
            </div>
            <div className="faq-item">
              <h4>Why does it only run locally?</h4>
              <p>
                The Flask server runs on your machine (port 5001). For
                production, you'd deploy the Python server to a cloud platform
                like Render, Railway, or AWS.
              </p>
            </div>
            <div className="faq-item">
              <h4>What does "V1 to V28" mean exactly?</h4>
              <p>
                They are Principal Component Analysis (PCA) features — a
                mathematical transformation of 28 original transaction attributes
                (time, merchant, location, etc.) that hides private info while
                preserving the fraud pattern signals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        🛡️ FraudGuard AI — Built with React + Flask + scikit-learn &nbsp;|&nbsp;
        For educational & demonstration purposes
      </footer>
    </>
  );
}
