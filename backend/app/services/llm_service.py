from mistralai import Mistral
from app.core.config import settings


async def generate_response(message: str) -> str:
    try:
        client = Mistral(api_key=settings.MISTRAL_API_KEY)
        response = client.chat.complete(
            model="mistral-large-latest",
            messages=[{"role": "user", "content": message}],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"