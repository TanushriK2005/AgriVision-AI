import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.utils import load_img, img_to_array

# ===================================
# Load Model
# ===================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../models/final_crop_disease_model.keras"
)

model = tf.keras.models.load_model(MODEL_PATH)

# ===================================
# Disease Classes
# ===================================

class_names = [
    'Pepper__bell___Bacterial_spot',
    'Pepper__bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Tomato_Bacterial_spot',
    'Tomato_Early_blight',
    'Tomato_Late_blight',
    'Tomato_Leaf_Mold',
    'Tomato_Septoria_leaf_spot',
    'Tomato_Spider_mites_Two_spotted_spider_mite',
    'Tomato__Target_Spot',
    'Tomato__Tomato_YellowLeaf__Curl_Virus',
    'Tomato__Tomato_mosaic_virus',
    'Tomato_healthy'
]

# ===================================
# Treatments
# ===================================

treatments = {

    "Pepper__bell___Bacterial_spot":
        "Apply copper-based fungicide and remove infected leaves.",

    "Pepper__bell___healthy":
        "Plant is healthy. No treatment required.",

    "Potato___Early_blight":
        "Apply Mancozeb fungicide and remove infected leaves.",

    "Potato___Late_blight":
        "Apply Chlorothalonil fungicide and avoid excess moisture.",

    "Potato___healthy":
        "Plant is healthy. No treatment required.",

    "Tomato_Bacterial_spot":
        "Use copper sprays and avoid overhead watering.",

    "Tomato_Early_blight":
        "Apply Mancozeb fungicide and remove infected leaves.",

    "Tomato_Late_blight":
        "Apply fungicide immediately and improve air circulation.",

    "Tomato_Leaf_Mold":
        "Reduce humidity and apply appropriate fungicide.",

    "Tomato_Septoria_leaf_spot":
        "Remove affected leaves and spray fungicide.",

    "Tomato_Spider_mites_Two_spotted_spider_mite":
        "Apply neem oil or miticide treatment.",

    "Tomato__Target_Spot":
        "Use fungicide and avoid wet foliage.",

    "Tomato__Tomato_YellowLeaf__Curl_Virus":
        "Control whiteflies and remove infected plants.",

    "Tomato__Tomato_mosaic_virus":
        "Remove infected plants and disinfect tools.",

    "Tomato_healthy":
        "Plant is healthy. No treatment required."
}


# ===================================
# Disease Prediction
# ===================================

def predict_disease(image_path):

    img = load_img(image_path, target_size=(128, 128))

    img = img_to_array(img)

    img = img / 255.0

    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img, verbose=0)

    class_index = np.argmax(prediction)

    confidence = float(np.max(prediction) * 100)

    disease = class_names[class_index]

    # Make disease name readable
    display_disease = (
        disease
        .replace("___", " ")
        .replace("__", " ")
        .replace("_", " ")
        .strip()
    )

    treatment = treatments.get(
        disease,
        "No treatment available."
    )

    return display_disease, confidence, treatment


print("Disease Model Loaded Successfully")
