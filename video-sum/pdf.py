import os
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from flask import Flask, request, jsonify
import json
from config.settings import supabase, embedding_model
from modules.ollama_helper import get_ollama_response as generate_answer_from_model

# Initialize Flask app and the model
app = Flask(__name__)


def extract_text_from_pdf(pdf_path):
    """Extracts text from all pages using 'blocks' for better accuracy."""
    doc = fitz.open(pdf_path)
    page_texts = {}
    print(f"Extracting text from {pdf_path} with pages = {len(doc)}")  # Debugging line

    for page_num in range(len(doc)):  # Ensure all pages are processed
        text = doc[page_num].get_text("blocks")
        combined_text = "\n".join([block[4] for block in text])  # Extract text content
        if combined_text.strip():  # Skip empty pages
            page_texts[page_num + 1] = combined_text  # Store with page number

    return page_texts  # Dictionary {page_num: text}

# --- Chunking Process ---
def chunk_pdf_text(pdf_path, chunk_size=1000, overlap=200):
    """Splits extracted text into chunks for vector search."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
    page_texts = extract_text_from_pdf(pdf_path)

    chunks = []

    for page_num, page_text in page_texts.items():
        page_chunks = text_splitter.split_text(page_text)
        for chunk in page_chunks:
            chunks.append(chunk)

    return chunks


def generate_summary(chunks):
    content = "\n".join(chunks)  # summarizing only first few chunks for performance
    prompt = f"""
    Summarize the following document content:

    {content}
    Summary Instructions:

    Please generate a detailed and coherent summary of the above document, analyzing it as a complete work (e.g., book, research paper, or report) — not just as raw text or segmented chunks.

    Your summary should include:

    Document Identity:

    Title (if identifiable)

    Author(s)

    Type of document (e.g., book, report, academic paper, manual)

    Date of publication (if present)

    Main Purpose:

    What is the primary aim or objective of this document?

    Who is the intended audience?

    Content Overview:

    Key topics and themes covered

    Structure of the content (chapters, sections, flow of arguments)

    Any important conclusions, takeaways, or findings

    Contextual Insight:

    If the document is a book, summarize it as such — highlighting narrative structure, core messages, or lessons.

    If it is academic or technical, identify the problem it addresses, the methodology used, and the results or insights.

    Avoid referring to internal data processing concepts like “chunks.” The summary should read naturally and professionally, as if written by someone who has read and understood the full document in its original form.
    """
    summary = generate_answer_from_model(prompt)
    return summary["message"]["content"]


# Function to calculate cosine similarity
def cosine_similarity(embedding1, embedding2):
    # This should return a similarity score (e.g., dot product or cosine similarity)
    dot_product = sum(a * b for a, b in zip(embedding1, embedding2))
    norm1 = sum(a * a for a in embedding1) ** 0.5
    norm2 = sum(b * b for b in embedding2) ** 0.5
    return dot_product / (norm1 * norm2) if norm1 and norm2 else 0

# Function to generate answer from Ollama or LLM
# def generate_answer_from_model(question, context):
#     # Call Ollama API or any other LLM model with the question and context
#     return "Generated answer based on the context"

# Function to store chunks in Supabase
def store_pdf_chunks(pdf_name, chunks, embeddings):
    """Store PDF chunks and embeddings in Supabase."""
    for chunk, embedding in zip(chunks, embeddings):
        supabase.table("pdf_chunks").insert({
            "chunk_text": chunk,
            "embedding": json.dumps(embedding.tolist()),  # Store as a JSON list
            "pdf_name": pdf_name,
        }).execute()
    print(f"Stored {len(chunks)} chunks for {pdf_name} in the database.")  # Debugging line

# Single endpoint for both uploading the PDF and asking the question
@app.route('/pdf_query', methods=['POST'])
def pdf_query():
    file = request.files.get('file')  # Check if file is provided
    question = request.form.get('question')
    pdf_name = request.form.get('pdf_name')


    if file:
        # If a file is present, process it and store the chunks in the database
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Save PDF to a temporary location
        file_path = os.path.join("static/pdf", file.filename)
        if not os.path.exists("static/pdf"):
            os.makedirs("static/pdf")
        file.save(file_path)
        print(f"Saved file to {file_path}")  # Debugging line

        # Extract chunks from the PDF
        chunks = chunk_pdf_text(file_path)
        print(f"Extracted {len(chunks)} chunks from the PDF.")  # Debugging line

        # Create embeddings for each chunk
        embeddings = embedding_model.encode(chunks)

        summary = generate_summary(chunks)
        # Store this in Supabase if needed:
        supabase.table("pdf_metadata").insert({
        "pdf_name": file.filename,
        "summary": summary
        }).execute()


        # Store chunks and embeddings in the Supabase database using the helper function
        store_pdf_chunks(file.filename, chunks, embeddings)
        print("done 2")

        return jsonify({"message": "Upload successful", "file_name": file.filename}), 200

    elif question and pdf_name:
        # If a question is provided, retrieve relevant chunks and generate an answer
        response = supabase.table("pdf_chunks").select("chunk_text, embedding").eq("pdf_name", pdf_name).execute()

        if response.data:
            rows = response.data
        else:
            return jsonify({"error": "No data found for the provided pdf_name"}), 404

        # Convert the question to embedding
        question_embedding = embedding_model.encode([question])[0]

        # Find the most relevant chunk by calculating cosine similarity
        top_chunks = []
        max_similarity = -1
        for row in rows:
            chunk_text = row['chunk_text']
            chunk_embedding = json.loads(row['embedding'])  # Parse JSON-encoded embedding
            similarity = cosine_similarity(question_embedding, chunk_embedding)
            top_chunks.append((similarity, chunk_text))
            # Sort chunks by similarity in descending order
        top_chunks.sort(reverse=True, key=lambda x: x[0])

        # Get the top 10 most similar chunks
        best_chunk = [chunk for similarity, chunk in top_chunks[:10]]

        chunk = "\n".join(best_chunk)
        
        response_sum = supabase.table("pdf_metadata").select("summary").eq("pdf_name", pdf_name).execute()

        summary = response_sum.data[0]['summary'] if response.data else None

        # Generate answer using Ollama or another LLM model
        content = f"Context:\n{chunk}\n\nSummary:\n{summary}\n\nQuestion:{question}\n\nAnswer:"
        answer = generate_answer_from_model(content)

        return jsonify({"answer": answer["message"]["content"]}), 200

    else:
        return jsonify({"error": "No file or question provided"}), 400

if __name__ == '__main__':
    app.run(debug=True)
