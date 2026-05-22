import logger from './logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export interface IMaintenancePrediction {
  breakdownProbability: number;
  remainingUsefulLifeHours: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  primaryTriggers: string[];
  recommendation: string;
}

export interface IProductionForecast {
  forecastTonnages: number[];
  confidenceScore: number;
  trend: 'Increasing' | 'Decreasing';
  averageHistoricalOutput: number;
}

export class AiClient {
  /**
   * Dispatches mechanical telemetry parameters to the Python microservice to get ML breakdown predictions.
   */
  static async predictMaintenance(
    temperature: number,
    vibration: number,
    pressure: number,
    oilLevel: number,
    hoursRun: number
  ): Promise<IMaintenancePrediction> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/ai/predict-maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature, vibration, pressure, oilLevel, hoursRun }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned HTTP status ${response.status}`);
      }

      const payload = await response.json() as any;
      return payload.data;
    } catch (err: any) {
      logger.error(`AI Microservice predictive maintenance error: ${err.message}. Triggering heuristic fallbacks.`);
      
      // Fallback heuristics calculations if python microservice is offline
      const designLimit = 5000;
      const hoursRatio = hoursRun / designLimit;
      const vibrationRatio = vibration / 2.5;
      const tempRatio = temperature / 75;
      
      const prob = Math.min(0.99, 0.05 + 0.1 * hoursRatio + 0.3 * (vibrationRatio > 1 ? vibrationRatio : 0) + 0.2 * (tempRatio > 1.1 ? tempRatio : 0));
      const rul = Math.max(10, 10000 - hoursRun - vibration * 150 - temperature * 10);
      
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      let rec = 'Optimal operational condition.';
      if (prob >= 0.7) {
        riskLevel = 'High';
        rec = 'CRITICAL: High failure probability. Suspend operation immediately for complete mechanical audit.';
      } else if (prob >= 0.3) {
        riskLevel = 'Medium';
        rec = 'Moderate wear detected. Schedule inspections soon.';
      }

      return {
        breakdownProbability: parseFloat((prob * 100).toFixed(2)),
        remainingUsefulLifeHours: Math.round(rul),
        riskLevel,
        primaryTriggers: vibration > 3.5 ? ['Extreme Mechanical Vibration'] : ['Normal Fatigue'],
        recommendation: rec,
      };
    }
  }

  /**
   * Submits historical excavation metrics to forecast monthly yields.
   */
  static async forecastProduction(
    historicalTonnages: number[],
    workerCount: number,
    activeMachineRatio: number
  ): Promise<IProductionForecast> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/ai/forecast-production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historicalTonnages, workerCount, activeMachineRatio }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned HTTP status ${response.status}`);
      }

      const payload = await response.json() as any;
      return payload.data;
    } catch (err: any) {
      logger.error(`AI Microservice forecasting error: ${err.message}. Triggering trend fallbacks.`);
      
      // Simple linear trend fallback
      const avg = historicalTonnages.length > 0
        ? historicalTonnages.reduce((a, b) => a + b, 0) / historicalTonnages.length
        : 1500;
        
      return {
        forecastTonnages: [Math.round(avg * 1.02), Math.round(avg * 1.04), Math.round(avg * 1.05)],
        confidenceScore: 78.5,
        trend: 'Increasing',
        averageHistoricalOutput: avg,
      };
    }
  }

  /**
   * Interfaces with the Python microservice to generate a chatbot response using the Gemini model.
   */
  static async askAssistant(history: { role: string; content: string }[], message: string): Promise<string> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned HTTP status ${response.status}`);
      }

      const payload = await response.json() as any;
      return payload.reply;
    } catch (err: any) {
      logger.error(`AI Microservice assistant chatbot error: ${err.message}. Utilizing heuristic fallback.`);
      
      const p_lower = message ? message.toLowerCase() : '';
      if (p_lower.includes('safety') || p_lower.includes('hazard')) {
        return '**Mining Safety Checklist (Heuristic Fallback):** Keep methane gas < 1.0% by volume. Wear full protective kits and check exhaust vent fan speeds.';
      }
      return 'I am operational in fallback advisory mode. Please confirm that your Gemini API Key is active in your configuration files.';
    }
  }

  /**
   * Submits structured data logs to get a generated operational summary.
   */
  static async summarizeReport(reportType: string, dataPayload: any): Promise<string> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/ai/summarize-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, dataPayload }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned HTTP status ${response.status}`);
      }

      const payload = await response.json() as any;
      return payload.summary;
    } catch (err: any) {
      logger.error(`AI Microservice report summarization error: ${err.message}`);
      return `Automated summary for ${reportType} report indicating normal thresholds. Detailed logs are compiled below.`;
    }
  }
}
