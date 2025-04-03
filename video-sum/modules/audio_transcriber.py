import os
from pydub import AudioSegment
from groq import Groq
import shutil

client = Groq()

def split_audio(audio_path, chunk_length_ms=60000):
    """Splits audio into smaller chunks for better processing."""
    audio = AudioSegment.from_wav(audio_path)
    chunks = [audio[i:i+chunk_length_ms] for i in range(0, len(audio), chunk_length_ms)]
    
    chunk_paths = []
    os.makedirs("static/audio_chunks", exist_ok=True)
    
    for idx, chunk in enumerate(chunks):
        chunk_path = f"static/audio_chunks/chunk_{idx}.wav"
        chunk.export(chunk_path, format="wav")
        chunk_paths.append(chunk_path)
    
    return chunk_paths

def transcribe_audio(audio_path):
    """Transcribes audio in chunks."""
    print("Starting Transcription...")
    chunk_paths = split_audio(audio_path)
    full_transcription = ""

    for chunk in chunk_paths:
        with open(chunk, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(chunk, file.read()),
                model="whisper-large-v3-turbo",
                response_format="verbose_json",
            )
            full_transcription += transcription.text + " "

    try:
        shutil.rmtree(audio_path)
        shutil.rmtree("static/audio_chunks")  # Recreate the empty directory
    except Exception as e:
        print(f"Error clearing directory static/audio_chunks: {e}")
    return full_transcription.strip()
