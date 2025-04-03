import ollama

def get_ollama_response(content):
    """Get response from the Ollama model based on content."""
    try:
        print("context "+content)
        response = ollama.chat(
            model="gemma3", 
            messages=[
                {"role": "system", "content": """
                    You are an AI that answers questions based strictly on the provided video content. 
                    Use only the given context and summary to generate accurate responses. 
                    If the information is missing, say 'The provided content does not contain relevant details.'
                 """
                },
                {"role": "user", "content": content}
                ]
        )
        return response
    except Exception as e:
        print(f"Error communicating with Ollama API: {e}")
        return {"message": {"content": "Sorry, I couldn't process the request."}}
