from groq import Groq

client = Groq()

system_prompt = """
Start with a warm introduction that draws the audience in, establishing the subject matter in a way that piques interest.

The tone of the speaker shifts throughout the video, varying from calm to energetic and back to reflective, matching the rhythm of the topic being discussed.

Key ideas and insights are elaborated upon, with moments of emphasis that underline the importance of certain concepts.

A thought-provoking question or revelation is presented, encouraging viewers to engage more deeply with the material.

The video concludes with a reflective ending, providing a sense of closure and leaving the audience with lingering thoughts.
"""

def get_summary(prompt):
    """Generates summary using LLM."""
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
    )

    return chat_completion.choices[0].message.content
