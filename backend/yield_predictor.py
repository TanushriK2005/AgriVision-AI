import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "..",
    "models",
    "yield_prediction_model.pkl"
)

AREA_ENCODER_PATH = os.path.join(
    BASE_DIR,
    "..",
    "..",
    "models",
    "area_encoder.pkl"
)

ITEM_ENCODER_PATH = os.path.join(
    BASE_DIR,
    "..",
    "..",
    "models",
    "item_encoder.pkl"
)

model = joblib.load(MODEL_PATH)
area_encoder = joblib.load(AREA_ENCODER_PATH)
item_encoder = joblib.load(ITEM_ENCODER_PATH)


def predict_yield(area, item, year, rainfall, pesticides, temperature):

    area_encoded = area_encoder.transform([area])[0]
    item_encoded = item_encoder.transform([item])[0]

    features = [[
        area_encoded,
        item_encoded,
        year,
        rainfall,
        pesticides,
        temperature
    ]]

    prediction = model.predict(features)

    return float(prediction[0])


print("Yield Prediction System Ready")
