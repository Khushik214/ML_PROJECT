import numpy as np
import pandas as pd
import pickle
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Load Model and Scaler
try:
    with open('model/model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('model/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    print("Model and Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model inputs: {e}")
    model = None
    scaler = None

@app.route('/')
def home():
    # Dashboard is now the home page
    return render_template('dashboard.html')

@app.route('/prediction')
def prediction_page():
    return render_template('prediction.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/transparency')
def transparency():
    return render_template('transparency.html')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/guidance')
def guidance():
    return render_template('guidance.html')

@app.route('/caution')
def caution():
    return render_template('caution.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model not loaded properly.'}), 500

    try:
        data = request.get_json()
        
        # Extract features (normalized to expected types)
        age = float(data['age'])
        gender = int(data['gender'])
        height = float(data['height'])
        weight = float(data['weight'])
        ap_hi = float(data['ap_hi'])
        ap_lo = float(data['ap_lo'])
        cholesterol = int(data['cholesterol'])
        gluc = int(data['gluc'])
        smoke = int(data['smoke'])
        alco = int(data['alco'])
        active = int(data['active'])
        
        # Calculate BMI
        height_m = height / 100.0
        bmi = weight / (height_m * height_m)
        
        # Create input array
        features = np.array([[age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active, bmi]])
        
        # Scale and Predict
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)
        prediction_value = int(prediction[0])
        
        confidence = 0
        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(features_scaled)
            confidence = round(np.max(probs) * 100, 1)
        
        return jsonify({
            'prediction': prediction_value,
            'confidence': confidence
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
