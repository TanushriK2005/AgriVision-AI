from mistralai import Mistral
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("MISTRAL_API_KEY")

client = Mistral(api_key=API_KEY)

# Conversation memory
chat_history = [
    {
    "role": "system",
    "content": """
    You are AgriVision AI, an agriculture expert assistant.

    IMPORTANT RULES:

    - Do not use markdown.
    - Do not use symbols like ###, ##, **, *, |, >.
    - Do not use emojis.
    - Do not use bullet symbols such as -, *, •.
- Use headings and numbered points only.
- Keep formatting clean and professional.
- End responses with a short recommendation section when appropriate.
    - Keep responses clean and professional.
    - Highlight important keywords using UPPERCASE only for crop names, diseases, fertilizers, and important recommendations.
- Use short headings.
- Do not write entire sentences in uppercase.
- Keep answers concise and professional.
- Maximum 150 words unless the user asks for detailed information.
    - Use numbered points where necessary.
    - Give direct and practical advice.
    - Keep responses concise and easy to understand.

    Help farmers with:
    - Crop recommendations
    - Fertilizers
    - Plant diseases
    - Yield improvement
    - Market prices
    """
}
]


def get_chatbot_response(message):

    try:

        # Store user message
        chat_history.append(
            {
                "role": "user",
                "content": message
            }
        )

        response = client.chat.complete(
            model="mistral-small-latest",
            messages=chat_history
        )

        bot_reply = response.choices[0].message.content

        # Store bot reply
        chat_history.append(
            {
                "role": "assistant",
                "content": bot_reply
            }
        )

        return bot_reply

    except Exception as e:

        return f"Mistral Error: {str(e)}"
