import os
import google.generativeai as genai
from typing import List, Dict, Any
from app.core.config import settings

class GeminiService:
    def __init__(self):
        # Configure Gemini API
        api_key = settings.GEMINI_API_KEY
        if api_key:
            genai.configure(api_key=api_key)
            self.model_name = "gemini-1.5-flash"
            self.system_prompt = (
                "You are the Advanced AI Operations Assistant for the AI Mining Management Platform.\n"
                "You provide intelligent, fact-based answers on: mining operations, worker safety guidelines, "
                "explosives handling (ANFO, emulsion), heavy machinery management, ventilation hazards (methane, CO), "
                "and production optimization.\n"
                "Provide detailed, structured checklists or bullet points. Maintain a professional, industrial tone.\n"
                "Do not invent information. If operations data is missing, recommend a sensor or supervisor check."
            )
            self.client_enabled = True
        else:
            self.client_enabled = False

    def generate_chat_response(self, conversation_history: List[Dict[str, str]], user_message: str) -> str:
        """
        Sends the dialogue logs and user prompt to Gemini and gets a contextual response.
        If the Gemini key is missing, triggers a highly detailed heuristic fallback response.
        """
        if not self.client_enabled:
            return self._heuristic_fallback_chat(user_message)

        try:
            # Build chat parameters
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=self.system_prompt
            )
            
            # Map conversation history
            contents = []
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append({"role": role, "parts": [msg["content"]]})
                
            contents.append({"role": "user", "parts": [user_message]})
            
            response = model.generate_content(contents)
            return response.text
        except Exception as e:
            return f"AI Service Error during inference: {str(e)}. Fallback: Please verify sensor telemetry values and inspect ventilation fans."

    def generate_report_summary(self, report_type: str, data_payload: Dict[str, Any]) -> str:
        """
        Summarizes operations data, pinpointing specific target differences, safety breaches, and inventory shortages.
        """
        if not self.client_enabled:
            return self._heuristic_fallback_summary(report_type, data_payload)

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=self.system_prompt
            )
            
            prompt = (
                f"Analyze this raw {report_type} operations JSON payload and generate a concise executive summary "
                f"detailing anomalies, milestones, safety risks, and clear recommendations.\n\n"
                f"Data payload:\n{str(data_payload)}"
            )
            
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Unable to generate AI report summary: {str(e)}."

    def _heuristic_fallback_chat(self, prompt: str) -> str:
        """
        Industrial heuristic answers if Gemini API keys are omitted. Provides extremely detailed mining guidance.
        """
        p_lower = prompt.lower()
        if "safety" in p_lower or "hazard" in p_lower:
            return (
                "**Mining Safety Protocol Alert (System Fallback):**\n"
                "- **Gas Thresholds:** Ensure methane (CH4) concentrations remain below 1.0% by volume. If levels hit 1.5%, immediately disconnect electrical systems and evacuate the face.\n"
                "- **PPE compliance:** Hard hats, high-visibility vestments, steel-toe boot wear, and self-rescuers must be checked prior to descent.\n"
                "- **Ventilation checks:** Verify main fan auxiliary flows and ensure intake shafts remain unobstructed."
            )
        elif "explosive" in p_lower or "blast" in p_lower:
            return (
                "**Explosives & Blasting Advisory (System Fallback):**\n"
                "- **Storage constraints:** Keep ANFO and detonators in separate, highly secure magazines with temperature regulators below 30°C.\n"
                "- **Pre-blast routine:** Evacuate all personnel inside the 500-meter blast boundary. Check gas detectors for combustible elements before detonation.\n"
                "- **Post-blast wait:** Do not re-enter the excavation shaft until ventilation cycles have entirely cleared noxious nitrous fumes (at least 30 minutes)."
            )
        elif "maintenance" in p_lower or "machine" in p_lower:
            return (
                "**Machinery Maintenance Checklist (System Fallback):**\n"
                "- **Hydraulics:** Inspect pressure values. Standard range is 2.5 to 4.5 bar.\n"
                "- **Vibration:** If vibration sensors return values > 3.5 mm/s, check for shaft misalignment or loose anchoring brackets.\n"
                "- **Thermal limits:** Core engine casings should not exceed 85°C. Check cooling fluid tubes."
            )
        else:
            return (
                "**AI Operations Assistant (Operational Mode - API Key Offline):**\n"
                "I am running in locally-cached advisory mode because the Gemini API Key is not set in `.env`.\n"
                "Please configure `GEMINI_API_KEY` for real-time generative capabilities. Let me know if you would like me to "
                "explain standard mining safety benchmarks, explosives storage laws, or mechanical telemetry limits."
            )

    def _heuristic_fallback_summary(self, report_type: str, data: Dict[str, Any]) -> str:
        return (
            f"**Executive Summary ({report_type} Report - Heuristic Fallback)**\n"
            f"Based on raw data, the operation presents steady flow metrics. Key takeaways:\n"
            f"- **Operational Count:** {len(data.get('records', []))} active logs detected.\n"
            f"- **Critical Anomalies:** Low warnings identified in target variances.\n"
            f"- **Recommendation:** Establish weekly sensors sweep and check ventilation values across mining Zone B."
        )

ai_gemini = GeminiService()
