<div align="center">

# 🛡️ FraudGuard AI

### Real-Time Credit Card Fraud Detection — Full Stack ML System

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)

**Analyse any credit card transaction in under 1 second using a Random Forest model trained on 284,000+ real transactions.**

[![View Demo]([#-how-to-run])](https://fraud-guard-zeta.vercel.app) 

</div>

---

## 📌 About This Project

FraudGuard AI is a full-stack machine learning application that detects fraudulent credit card transactions in real time. A user submits transaction data through a clean, intuitive web interface — the system passes it to a trained Random Forest model and returns an instant verdict with a fraud risk score, visual gauge, and plain-English recommended action.

**Built with:**
- A **Python/Flask** server that hosts the ML model and serves predictions via REST API
- A **React (Vite)** frontend with a full landing page, sample transactions, and animated results
- A **Node.js/Express** server with **PostgreSQL** (via Sequelize) for transaction logging
- A **scikit-learn Random Forest Classifier** trained on the Kaggle Credit Card Fraud dataset

---

## ✨ Key Features

- 🔍 **Real-time fraud prediction** — results in under 1 second
- 📊 **Fraud risk score** from 0.0 (safe) to 1.0 (certain fraud) with animated gauge
- 🧪 **4 built-in sample transactions** — load pre-filled examples with one click (safe, medium risk, fraud)
- 🧠 **Random Forest model** with 100 decision trees trained on 284,807 transactions
- ⚖️ **Balanced training data** — upsampled fraud cases to prevent model bias
- 🎨 **Premium dark UI** — sticky navbar, hero section, how-it-works guide, FAQ
- 🔌 **Friendly error handling** — clear guidance if the AI server is not running
- 📱 **Responsive layout** — works on desktop and mobile

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│           React Frontend  (localhost:5174)               │
│   Hero · Samples · Form · Result Panel · FAQ             │
└────────────────────────┬────────────────────────────────┘
                         │  POST /predict  (Axios)
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Python Flask Server  (localhost:5001)          │
│        Loads fraud_model.pkl → RandomForestClassifier    │
│        Returns: { isFraudulent, fraudScore }             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Node.js Express Server  (localhost:5000)       │
│        POST /api/transactions → saves to PostgreSQL      │
│        (Transaction logging layer — in progress)         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
Fraud_Detection/
│
├── fraud-Backend/
│   ├── app.py                      # 🐍 Flask ML prediction server (port 5001)
│   ├── fraud_model.py              # 🏋️  Model training script
│   ├── fraud_model.pkl             # 💾 Trained Random Forest model (saved)
│   ├── model_features.pkl          # 📋 Feature names used by the model
│   ├── creditcard.csv              # 📊 Kaggle credit card fraud dataset
│   ├── PS_20174392719_...log.csv   # 📊 PaySim synthetic dataset
│   │
│   ├── app.js                      # 🟩 Express server (port 5000)
│   ├── models/Transaction.js       # 🗃️  Sequelize Transaction model
│   ├── controllers/transactionController.js
│   ├── routes/transactionRoutes.js
│   ├── services/fraudService.js    # ⚠️  Placeholder — not yet wired to Flask
│   └── config/db.js                # 🔗 PostgreSQL connection (needs .env)
│
└── fraud-frontend/
    └── fraud-checker/
        └── src/
            ├── App.jsx             # ⚛️  Main React app (full landing page)
            ├── App.css             # 🎨 Premium dark design system
            └── index.css           # 🔧 Global reset & CSS tokens
```

---

## 🤖 The ML Model

| Property | Detail |
|----------|--------|
| Algorithm | Random Forest Classifier |
| Trees | 100 estimators |
| Training set | 284,807 transactions (Kaggle dataset) |
| Fraud cases | 492 (0.17%) — upsampled to balance classes |
| Features | 28 PCA-transformed features (V1–V28) + Amount |
| Output | `isFraudulent` (bool) + `fraudScore` (0.0–1.0) |

### Risk Score Thresholds

| Score | Risk Level | Recommended Action |
|-------|------------|-------------------|
| `0.00 – 0.29` | 🟢 Low | Approve transaction |
| `0.30 – 0.64` | 🟡 Medium | Send verification SMS to cardholder |
| `0.65 – 1.00` | 🔴 High | Block card & contact cardholder |

### What are V1–V28?

These are **PCA-transformed features** — original transaction attributes (merchant, location, device, etc.) have been mathematically encoded to protect cardholder privacy while preserving the fraud-detection signal. The `Amount` field is the only untransformed feature.

---

## 🚀 How to Run

You need **two terminal windows** open simultaneously.

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.x | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 14+ | [postgresql.org](https://postgresql.org) *(optional — only for transaction logging)* |

---

### Step 1 — Start the Python AI Server

```bash
cd fraud-Backend

# Install dependencies (first time only)
pip install flask flask-cors pandas scikit-learn joblib

# Optional: re-train the model from scratch
python3 fraud_model.py

# Start the prediction server
python3 app.py
```

> ✅ Running at `http://localhost:5001`

---

### Step 2 — Start the React Frontend

Open a **second terminal**:

```bash
cd fraud-frontend/fraud-checker

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

> ✅ Open **[http://localhost:5174](http://localhost:5174)** in your browser

---

### Step 3 — (Optional) Start the Node.js Server

This enables transaction logging to PostgreSQL. First create a `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=fraud_detection
```

Then:

```bash
cd fraud-Backend
npm install
node app.js
```

> ✅ Running at `http://localhost:5000`

---

### Stopping Everything

Press `Ctrl + C` in each terminal window.

---

## 🎮 Using the App

1. **Open** `http://localhost:5174` in your browser
2. **Click any sample card** (Grocery, Online Transfer, etc.) to auto-fill the form, OR manually enter values
3. **Click "Analyse Transaction"** — the AI responds in under a second
4. **Read the result**: verdict, fraud score gauge, risk level, and recommended action

> 💡 **Tip:** Use the "Suspected Fraudulent Card Use" sample to see a fraud detection in action.

---

## 🚧 Known Issues & Roadmap

### 🔴 In Progress

| Issue | Details |
|-------|---------|
| `fraudService.js` is a placeholder | Currently uses `Math.random()` instead of calling Flask. Needs to be wired to `http://localhost:5001/predict` |
| `config/db.js` missing | Database config needs to be created and `.env` set up |

### 🟡 Planned Improvements

- [ ] Wire Node.js `fraudService.js` to the Flask `/predict` endpoint
- [ ] Set up `config/db.js` and PostgreSQL transaction logging
- [ ] Add a dashboard page with transaction history and fraud statistics charts
- [ ] Add JWT authentication for secure access
- [ ] Allow users to enter plain transaction details instead of raw V1–V28 PCA values
- [ ] Write unit tests for model, Flask API, and Express routes
- [ ] Deploy Flask to [Render](https://render.com) or [Railway](https://railway.app), frontend to [Vercel](https://vercel.com)
- [ ] Add real-time fraud alerts via email or SMS (Twilio/SendGrid)
- [ ] Experiment with XGBoost and Neural Networks to improve accuracy

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | scikit-learn `RandomForestClassifier` |
| ML Server | Python 3, Flask, flask-cors, joblib, pandas |
| App Server | Node.js, Express.js, Sequelize ORM |
| Database | PostgreSQL |
| Frontend | React 19, Vite, Axios |
| Styling | Vanilla CSS (custom design system, dark mode) |

---

## 📂 Datasets

| File | Source | Size |
|------|--------|------|
| `creditcard.csv` | [Kaggle — Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) | 284,807 rows |
| `PS_20174392719_...log.csv` | [PaySim Synthetic Dataset](https://www.kaggle.com/datasets/ealaxi/paysim1) | Synthetic bank transactions |

> ⚠️ These CSV files are large and should **not** be committed to GitHub. Add them to `.gitignore`.

---

## 📄 .gitignore Recommendation

Before pushing to GitHub, make sure your `.gitignore` includes:

```gitignore
# Python
__pycache__/
*.pyc
*.pyo
*.pkl

# Node
node_modules/
.env

# Large data files
*.csv

# OS files
.DS_Store
```

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ using Python · Flask · React · scikit-learn · Node.js · PostgreSQL

</div>
