import json
from config.settings import supabase, embedding_model
import numpy as np
# text_utils.py

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


def store_summary(video_filename, summary):
    """Store summary with embeddings in Supabase."""
    embedding = embedding_model.encode(summary).tolist()
    supabase.table("video_summaries").insert({
        "video_filename": video_filename,
        "summary": summary,
        "embedding": json.dumps(embedding)
    }).execute()

def store_knowledge(video_filename, transcription, frame_data, summary):
    """Store transcriptions & frames separately in Supabase."""
    text_chunks = chunk_text(transcription)
    for chunk in text_chunks:
        embedding = embedding_model.encode(chunk).tolist()
        supabase.table("audio_knowledge").insert({
            "video_filename": video_filename,
            "text_chunk": chunk,
            "embedding": json.dumps(embedding)
        }).execute()

    frame_chunks = chunk_text(frame_data)
    for chunk in frame_chunks:
        embedding = embedding_model.encode(chunk).tolist()
        supabase.table("frame_knowledge").insert({
            "video_filename": video_filename,
            "text_chunk": chunk,
            "embedding": json.dumps(embedding)
        }).execute()

    store_summary(video_filename, summary)

# 🔹 Retrieve Most Relevant Chunks (Efficient Querying)
def fetch_relevant_chunks(video_filename, question, top_n=2):
    """
    Fetches the most relevant text chunks from audio & frame data using vector similarity.
    """
    question_embedding = embedding_model.encode(question).tolist()
    table_names = ["audio_knowledge", "frame_knowledge"]

    all_chunks = []
    for table in table_names:
        response = supabase.table(table).select("*").eq("video_filename", video_filename).execute()
        records = response.data or []

        for record in records:
            stored_embedding = np.array(json.loads(record["embedding"]))
            similarity = np.dot(question_embedding, stored_embedding) / (
                np.linalg.norm(question_embedding) * np.linalg.norm(stored_embedding)
            )
            all_chunks.append((similarity, record["text_chunk"]))

    # Sort by highest similarity and return top chunks
    all_chunks.sort(reverse=True, key=lambda x: x[0])
    top_chunks = [chunk for _, chunk in all_chunks[:top_n]]
    print("done")

    return "\n".join(top_chunks)

def fetch_summary(video_filename):
    return supabase.table("video_summaries").select("summary").eq("video_filename", video_filename).execute()