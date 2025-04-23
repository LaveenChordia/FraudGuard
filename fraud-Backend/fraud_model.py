import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.utils import resample
import joblib

def load_data():
    df = pd.read_csv("creditcard.csv")
    return df

def train_model():
    df = load_data()

    features = [f"V{i}" for i in range(1, 29)] + ["Amount"]

    # Balance the dataset by upsampling frauds
    df_majority = df[df.Class == 0]
    df_minority = df[df.Class == 1]

    df_minority_upsampled = resample(
        df_minority,
        replace=True,
        n_samples=len(df_majority),
        random_state=42
    )

    df_balanced = pd.concat([df_majority, df_minority_upsampled])

    X = df_balanced[features]
    y = df_balanced["Class"]

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Save model and features
    joblib.dump(model, "fraud_model.pkl")
    print("Model and features loaded.")
    joblib.dump(features, "model_features.pkl")

    print("Model trained and saved.")

if __name__ == "__main__":
    train_model()
