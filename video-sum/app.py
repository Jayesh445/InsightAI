from flask import Flask, request, jsonify
import os
from modules.video_processing import get_audio, get_frames
from modules.audio_transcriber import transcribe_audio
from modules.image_processor import process_frames
from modules.summarizer import get_summary
from modules.database import store_knowledge, fetch_relevant_chunks,fetch_summary
from modules.ollama_helper import get_ollama_response

app = Flask(__name__)

@app.route("/")
def home():
    return "Welcome to the Optimized Video Processing API!"

@app.route("/upload_video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided!"}), 400

    video = request.files["video"]
    video_filename = video.filename
    video_path = os.path.join("static/video", video_filename)
    video.save(video_path)

    get_audio(video_path)
    audio_path = "static/audio/output.wav"
    transcription = transcribe_audio(audio_path)

    print("Transcription    "+transcription)

    get_frames(video_path)
    frame_data = process_frames(video_path,transcription)

    os.remove(video_path)

    summary = get_summary(transcription)
    store_knowledge(video_filename, transcription, frame_data, summary)

    return jsonify({"message": "Video processed successfully!", "summary": summary}), 200

@app.route("/ask", methods=["POST"])
def ask():
    user_question = request.json.get("question")
    video_filename = request.json.get("video_filename")

    if not user_question or not video_filename:
        return jsonify({"error": "Question or video filename missing!"}), 400

    try:
        # Fetch the summary and relevant chunks from the database
        context = fetch_relevant_chunks(video_filename, user_question)
        print("context"+context)
        print("video_filename"+video_filename)
        summary=fetch_summary(video_filename)

        print(summary)
        # Generate the response using Ollama
        content = f"Context:\n{context}\n\nSummary:\n{summary}\n\nQuestion: {user_question}\n\nAnswer:"
        gemini_response = get_ollama_response(content)

        return jsonify({"answer": gemini_response["message"]["content"]}), 200

    except Exception as e:

        return jsonify({"error": f"Error occurred: {str(e)}"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)
