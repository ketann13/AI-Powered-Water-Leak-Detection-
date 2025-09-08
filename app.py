from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load trained model
model_path = os.path.join(os.getcwd(), 'water_leak_detection_model.pkl')
model = joblib.load(model_path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        pressure = float(data['pressure'])
        flow_rate = float(data['flow_rate'])
        temperature = float(data['temperature'])

        # Custom rule: only temperature exceeds threshold
        if temperature > 80 and pressure <= 395 and flow_rate <= 700:
            result = "Leak Detected! (Temp Threshold) 🚨"
        else:
            # Fall back to ML model prediction
            features = np.array([[pressure, flow_rate, temperature]])
            prediction = model.predict(features)[0]
            result = "Leak Detected! (Model) 🚨" if prediction == 1 else "No Leak ✅"

        return jsonify({'prediction': result})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
