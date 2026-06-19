from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from utils.yield_predictor import predict_yield
from utils.disease_predictor import predict_disease
from utils.crop_recommendation_predictor import recommend_crop
from utils.fertilizer_advisor import recommend_fertilizer
from utils.market_price import get_market_price
from utils.chatbot import get_chatbot_response

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/")
def home():
    return {
        "message": "Smart Agriculture Advisor API Running"
    }


# ===================================
# Yield Prediction API
# ===================================

@app.route("/predict_yield", methods=["POST"])
def predict_crop_yield():

    try:

        data = request.get_json()

        prediction = predict_yield(
            area=data["area"],
            item=data["item"],
            year=data["year"],
            rainfall=data["rainfall"],
            pesticides=data["pesticides"],
            temperature=data["temperature"]
        )

        return jsonify({
            "success": True,
            "predicted_yield": round(prediction, 2)
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ===================================
# Disease Detection API
# ===================================

@app.route("/predict_disease", methods=["POST"])
def disease_detection():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image uploaded"
            })

        image = request.files["image"]

        image_path = os.path.join(
            UPLOAD_FOLDER,
            image.filename
        )

        image.save(image_path)

        disease, confidence, treatment = predict_disease(image_path)

        return jsonify({
            "success": True,
            "disease": disease,
            "confidence": round(confidence, 2),
            "treatment": treatment
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ===================================
# Crop Recommendation API
# ===================================

@app.route("/recommend_crop", methods=["POST"])
def crop_recommendation():

    try:

        data = request.get_json()

        crop = recommend_crop(
            N=data["N"],
            P=data["P"],
            K=data["K"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            ph=data["ph"],
            rainfall=data["rainfall"]
        )

        return jsonify({
            "success": True,
            "recommended_crop": crop
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ===================================
# Fertilizer Advisor API
# ===================================

@app.route("/fertilizer_advisor", methods=["POST"])
def fertilizer_advisor_api():

    try:

        data = request.get_json()

        result = recommend_fertilizer(
            data["N"],
            data["P"],
            data["K"]
        )

        return jsonify({
            "success": True,
            "fertilizer": result["fertilizer"],
            "reason": result["reason"]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
        
        
        # ===================================
# Market Price API
# ===================================

@app.route("/market_price", methods=["POST"])
def market_price_api():

    try:

        data = request.get_json()

        result = get_market_price(
            data["crop"]
        )

        return jsonify({
            "success": True,
            "price": result["price"],
            "trend": result["trend"],
            "recommendation": result["recommendation"]
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
        
# ===================================
# Gemini Chatbot API
# ===================================

@app.route("/chatbot", methods=["POST"])
def chatbot():

    try:

        data = request.get_json()

        user_message = data["message"]

        response = get_chatbot_response(
            user_message
        )

        return jsonify({
            "success": True,
            "response": response
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
        
    
if __name__ == "__main__":
    app.run(debug=True)
    


