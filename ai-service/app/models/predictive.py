import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from typing import Dict, List, Any

class MiningPredictiveAnalytics:
    def __init__(self):
        # 1. Initialize Predictive Maintenance models with synthetically generated historical failures
        self._init_maintenance_models()

    def _init_maintenance_models(self):
        # Generate training data: temperature (°C), vibration (mm/s), pressure (bar), oilLevel (%), hoursRun (h)
        np.random.seed(42)
        n_samples = 500
        
        temp = np.random.normal(70, 10, n_samples)
        vib = np.random.normal(2.5, 0.8, n_samples)
        pres = np.random.normal(4.0, 1.0, n_samples)
        oil = np.random.uniform(50, 100, n_samples)
        hours = np.random.uniform(100, 8000, n_samples)
        
        # Calculate risk score which leads to breakdown label
        # High temperature, high vibration, low oil level, and high operating hours increase failure risk
        risk_score = (
            (temp - 70) * 0.03 + 
            (vib - 2.5) * 0.2 + 
            (4.0 - pres) * 0.05 + 
            (100 - oil) * 0.02 + 
            hours * 0.0001
        )
        
        # Probability of breakdown mapped between 0 and 1
        prob = 1 / (1 + np.exp(-risk_score))
        breakdown_labels = (prob > 0.6).astype(int)
        
        # Fit Random Forest Classifier for breakdown prediction
        X = pd.DataFrame({
            'temperature': temp,
            'vibration': vib,
            'pressure': pres,
            'oilLevel': oil,
            'hoursRun': hours
        })
        y = breakdown_labels
        
        self.maintenance_rf = RandomForestClassifier(n_estimators=50, random_state=42)
        self.maintenance_rf.fit(X, y)

        # Fit Remaining Useful Life (RUL) regression model
        # RUL decreases linearly as operating hours increase, and degrades faster under high vibration/temp
        rul = 10000 - hours - (vib * 200) - (temp * 15)
        rul = np.clip(rul, 100, 10000) # clip to realistic boundaries
        
        self.rul_regressor = LinearRegression()
        self.rul_regressor.fit(X, rul)

    def predict_maintenance_risk(
        self, 
        temperature: float, 
        vibration: float, 
        pressure: float, 
        oil_level: float, 
        hours_run: float
    ) -> Dict[str, Any]:
        """
        Runs machine learning inference to predict breakdown probability, risk level, and Remaining Useful Life.
        """
        features = pd.DataFrame([{
            'temperature': temperature,
            'vibration': vibration,
            'pressure': pressure,
            'oilLevel': oil_level,
            'hoursRun': hours_run
        }])
        
        # Predict breakdown probability
        prob = self.maintenance_rf.predict_proba(features)[0][1]
        
        # Predict remaining useful life (hours)
        predicted_rul = float(self.rul_regressor.predict(features)[0])
        predicted_rul = max(0.0, round(predicted_rul, 1))

        # Classify risk level
        if prob < 0.3:
            risk_level = "Low"
            recommendation = "Optimal operational condition. Maintain standard schedule."
        elif prob < 0.7:
            risk_level = "Medium"
            recommendation = "Moderate wear detected. Schedule inspections and check oil/cooling levels soon."
        else:
            risk_level = "High"
            recommendation = "CRITICAL: High failure probability. Suspend operation immediately for complete mechanical audit."

        # Pinpoint primary failure triggers
        triggers = []
        if temperature > 80:
            triggers.append("Thermal Overheating")
        if vibration > 3.5:
            triggers.append("Extreme Mechanical Vibration")
        if oil_level < 70:
            triggers.append("Low Lubricant levels")
        if hours_run > 6000:
            triggers.append("Mechanical Lifespan Fatigue")

        return {
            "breakdownProbability": float(round(prob * 100, 2)),
            "remainingUsefulLifeHours": predicted_rul,
            "riskLevel": risk_level,
            "primaryTriggers": triggers if triggers else ["None"],
            "recommendation": recommendation
        }

    def forecast_production(
        self, 
        historical_tonnages: List[float], 
        worker_count: int, 
        active_machine_ratio: float, 
        months_to_forecast: int = 3
    ) -> Dict[str, Any]:
        """
        Forecasts future mining excavation tonnages for upcoming months using linear time series regression, 
        accounting for active labor force size and mechanical availability indexes.
        """
        n_periods = len(historical_tonnages)
        if n_periods < 3:
            # Fallback if insufficient historical dataset
            historical_tonnages = [1200.0, 1350.0, 1400.0, 1550.0, 1600.0]
            n_periods = len(historical_tonnages)

        # Regress historical tonnages against period indexes
        X_time = np.array(range(n_periods)).reshape(-1, 1)
        y = np.array(historical_tonnages)
        
        reg = LinearRegression()
        reg.fit(X_time, y)
        
        forecast = []
        for i in range(months_to_forecast):
            next_period = n_periods + i
            # Base linear forecast
            base_pred = reg.predict([[next_period]])[0]
            
            # Apply adjustments for active worker capacity and machine availability
            # 10 workers is the baseline; active machine ratio 1.0 is standard
            labor_multiplier = max(0.5, worker_count / 15.0)
            machinery_multiplier = max(0.4, active_machine_ratio)
            
            final_pred = base_pred * (0.6 + 0.2 * labor_multiplier + 0.2 * machinery_multiplier)
            forecast.append(float(round(max(100.0, final_pred), 2)))

        # Calculate confidence metric based on variance of historical data
        hist_variance = float(np.std(historical_tonnages) / np.mean(historical_tonnages))
        confidence = max(50.0, round((1.0 - hist_variance) * 100, 2))

        return {
            "forecastTonnages": forecast,
            "confidenceScore": confidence,
            "trend": "Increasing" if reg.coef_[0] > 0 else "Decreasing",
            "averageHistoricalOutput": float(round(np.mean(historical_tonnages), 2))
        }

analytics = MiningPredictiveAnalytics()
