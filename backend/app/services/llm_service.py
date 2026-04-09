from google import genai
from app.core.config import settings

# Create a client instance with the API key
client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_response(message: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=message
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"