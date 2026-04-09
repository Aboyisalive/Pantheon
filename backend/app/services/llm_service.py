from google import genai
from app.core.config import settings


async def generate_response(message: str) -> str:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=message,
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"