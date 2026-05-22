import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predictions import router as ai_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Microservice providing machine learning forecasting and Gemini AI chatbot services.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register AI router
app.include_router(ai_router)

# Health check route
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "api_key_configured": settings.GEMINI_API_KEY != ""
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
