async def save_message(user_id: str, user_msg: str, ai_msg: str):
    """
    Persist chat messages.
    Replace with real DB logic later.
    """

    # Future:
    # - Insert into messages table
    # - Link to conversation_id

    print(f"[MEMORY] {user_id}: {user_msg} -> {ai_msg}")