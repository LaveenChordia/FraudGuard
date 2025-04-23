import { useState } from "react";
import axios from "axios";
import "./App.css";

const initialValues = {
  Amount: "",
  V1: "", V2: "", V3: "", V4: "", V5: "",
  V6: "", V7: "", V8: "", V9: "", V10: "",
  V11: "", V12: "", V13: "", V14: "", V15: "",
  V16: "", V17: "", V18: "", V19: "", V20: "",
  V21: "", V22: "", V23: "", V24: "", V25: "",
  V26: "", V27: "", V28: ""
};

function App() {
  const [input, setInput] = useState(initialValues);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5001/predict", input);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Something went wrong!" });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">Fraud Detection System</h1>

      <form onSubmit={handleSubmit} className="form">
        {Object.keys(input).map((key) => (
          <div key={key} className="form-group">
            <label>{key}</label>
            <input
              type="number"
              name={key}
              value={input[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" className="submit-btn">
          {loading ? "Checking..." : "Check Transaction"}
        </button>
      </form>

      {result && (
        <div className="result-card">
          {result.error ? (
            <p className="error">{result.error}</p>
          ) : (
            <>
              <p>
                <strong>Is Fraudulent:</strong>{" "}
                <span className={result.isFraudulent ? "fraud" : "not-fraud"}>
                  {String(result.isFraudulent)}
                </span>
              </p>
              <p>
                <strong>Fraud Score:</strong>{" "}
                <span className="score">{result.fraudScore}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
