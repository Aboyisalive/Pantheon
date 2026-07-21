from mistralai import Mistral
from app.core.config import settings


def _build_messages(message: str, history: list[dict] | None = None) -> list[dict]:
    messages = [
        {"role": "system", "content": "Be witty, straightforward, and to the point. Preserve logic and clear reasoning. Keep responses concise — 750 characters maximum."},
    ]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": message})
    return messages


async def generate_response(message: str, history: list[dict] | None = None) -> str:
    try:
        client = Mistral(api_key=settings.MISTRAL_API_KEY)
        response = await client.chat.stream_async(
            model="mistral-large-latest",
            messages=_build_messages(message, history),
        )
        full = ""
        async for chunk in response:
            token = chunk.data.choices[0].delta.content
            if token:
                full += token
        return full
    except Exception as e:
        return f"Error: {str(e)}"


async def generate_stream(message: str, history: list[dict] | None = None):
    client = Mistral(api_key=settings.MISTRAL_API_KEY)
    try:
        response = await client.chat.stream_async(
            model="mistral-large-latest",
            messages=_build_messages(message, history),
        )
        async for chunk in response:
            token = chunk.data.choices[0].delta.content
            if token:
                yield f"data: {token}\n\n"
    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"
    finally:
        yield "data: [DONE]\n\n"