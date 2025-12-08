import re
import html

max_length = 1000


def sanitizePrompt(text: str) -> str:
    if not text:
        return ""

    # Truncate strictly for safety first (prevent memory overflow)
    text = text[:max_length]

    # Decode HTML entities (e.g., &amp; -> &)
    text = html.unescape(text)

    # Remove HTML tags (if user pasted from a website)
    text = re.sub(r'<[^>]+>', '', text)

    # Collapse multiple spaces/newlines into single space
    text = re.sub(r'\s+', ' ', text).strip()

    return text
