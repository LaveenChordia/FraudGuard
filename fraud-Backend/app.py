from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from pathlib import Path

print("Checking model files...")
print("fraud_model.pkl exists:", Path("fraud_model.pkl").exists())
print("model_features.pkl exists:", Path("model_features.pkl").exists())


try:
    model = joblib.load("fraud_model.pkl")
    model_features = joblib.load("model_features.pkl")
    print("Model and features loaded.")
except Exception as e:
    print("Failed to load model:", e)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    try:
        input_df = pd.DataFrame([data], columns=model_features)
    except KeyError as e:
        return jsonify({"error": f"Missing feature: {e}"}), 400

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    return jsonify({
        'isFraudulent': bool(prediction),
        'fraudScore': float(round(probability, 4))
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
