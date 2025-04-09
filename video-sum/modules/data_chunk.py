
def chunk_text(text, max_chunk_size=500):
    """
    Splits text into chunks of a specified maximum size while preserving sentence boundaries.
    """
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Invalid text input: Must be a non-empty string")

    chunks = []
    while len(text) > max_chunk_size:
        split_point = text.rfind(". ", 0, max_chunk_size)
        if split_point == -1:
            split_point = max_chunk_size  # Force split if no good sentence break is found
        chunks.append(text[:split_point + 1].strip())
        text = text[split_point + 1:].strip()

    chunks.append(text.strip())  # Add remaining text
    return chunks