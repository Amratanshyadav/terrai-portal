from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from app.models.predictive import analytics
from app.services.gemini import ai_gemini

router = APIRouter(prefix="/ai", tags=["AI Operations Services"])

# --- Request & Response Schemas ---

class TelemetryInput(BaseModel):
    temperature: float = Field(..., example=72.5)
    vibration: float = Field(..., example=2.3)
    pressure: float = Field(..., example=3.8)
    oilLevel: float = Field(..., example=92.0)
    hoursRun: float = Field(..., example=1200.0)

class ForecastInput(BaseModel):
    historicalTonnages: List[float] = Field(..., example=[1100, 1250, 1300, 1420, 1500])
    workerCount: int = Field(..., example=12)
    activeMachineRatio: float = Field(..., example=0.85)
    monthsToForecast: Optional[int] = Field(3, example=3)

class ChatMessage(BaseModel):
    role: str = Field(..., example="user")
    content: str = Field(..., example="What are the safety levels for methane gas?")

class ChatInput(BaseModel):
    history: List[ChatMessage]
    message: str = Field(..., example="Summarize explosives storage limits.")

class ReportSummaryInput(BaseModel):
    reportType: str = Field(..., example="Production")
    dataPayload: Dict[str, Any]

# --- Route Handlers ---

@router.post("/predict-maintenance")
async def run_predictive_maintenance(payload: TelemetryInput):
    try:
        results = analytics.predict_maintenance_risk(
            temperature=payload.temperature,
            vibration=payload.vibration,
            pressure=payload.pressure,
            oil_level=payload.oilLevel,
            hours_run=payload.hoursRun
        )
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast-production")
async def run_production_forecast(payload: ForecastInput):
    try:
        results = analytics.forecast_production(
            historical_tonnages=payload.historicalTonnages,
            worker_count=payload.workerCount,
            active_machine_ratio=payload.activeMachineRatio,
            months_to_forecast=payload.monthsToForecast
        )
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def run_ai_chat(payload: ChatInput):
    try:
        # Convert Pydantic message list to simple dictionary list
        history_list = [{"role": msg.role, "content": msg.content} for msg in payload.history]
        response_text = ai_gemini.generate_chat_response(
            conversation_history=history_list,
            user_message=payload.message
        )
        return {"status": "success", "reply": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-report")
async def run_report_summary(payload: ReportSummaryInput):
    try:
        summary_text = ai_gemini.generate_report_summary(
            report_type=payload.reportType,
            data_payload=payload.dataPayload
        )
        return {"status": "success", "summary": summary_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
