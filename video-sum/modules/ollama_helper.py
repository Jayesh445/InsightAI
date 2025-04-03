import ollama

def get_ollama_response(content):
    """Get response from the Ollama model based on content."""
    try:
        print("context "+content)
        response = ollama.chat(
            model="gemma3", 
            messages=[
                # {"role": "system", "content": """
                #     You are an AI assistant that provides answers strictly based on the given video content. 
                #     You are provided with:
                #     - Context: A detailed description of what is happening in the video.
                #     - Summary: A structured explanation of the video's content, including its main points.
                    
                #     Your goal:
                #     - Use both the **Context** and **Summary** to answer questions accurately.
                #     - If asked for a summary, extract the most relevant details from the provided summary.
                #     - If the user asks something not explicitly covered, infer the best possible answer using the given content.
                #     - Only respond with "The provided content does not contain relevant details" if **neither** the context nor the summary contains an answer.
                    
                #     Be concise and to the point while maintaining clarity.
                #  """
                # },
                {"role": "user", "content": content}
                ]
        )
        return response
    except Exception as e:
        print(f"Error communicating with Ollama API: {e}")
        return {"message": {"content": "Sorry, I couldn't process the request."}}
