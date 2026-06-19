import joblib
import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../models/crop_recommendation_model.pkl"
)

model = joblib.load(MODEL_PATH)

def recommend_crop(
    N,
    P,
    K,
    temperature,
    humidity,
    ph,
    rainfall
):
    prediction = model.predict([[
        N,
        P,
        K,
        temperature,
        humidity,
        ph,
        rainfall
    ]])

    return prediction[0]

print("Crop Recommendation Model Loaded Successfully")
