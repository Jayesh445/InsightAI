import glob
import os
import ollama
import shutil

def process_images_in_batches(image_list,transcription, batch_size=4):
    """Processes images in batches using Ollama and returns the combined frame descriptions."""
    
    frame_data = ""  # Initialize frame data string to store the descriptions
    prev_frame_data = ""
    for i in range(0, len(image_list), batch_size):
        batch_images = image_list[i:i + batch_size]
        response = ollama.chat(
            model='gemma3', 
            messages=[{
                'role': 'user', 
                'content': f"""
                    You have been provided with several frames of a video.
                Here is the **transcribed audio** that accompanies the video:

                **Transcription:**
                {transcription}

                Here is the **previous frame data** to maintain continuity:

                **Previous Frame Data:**
                {prev_frame_data}

                **Task:**
                - Describe what is happening in the current frames based on both the previous frame data and the transcription.
                - Ensure the description flows seamlessly from the previous frames.
                - Use details from the transcription to enrich the scene description, explaining what is happening visually in the current frame.
                - Avoid technical terms (like frames or images); focus solely on the events, actions, and context.
                - Keep the narrative natural and engaging, as if explaining a scene to someone who hasn’t seen the video.

                **Example Response:**

                **Previous Frame Data:** 
                A woman stands in her kitchen, chopping vegetables while the sound of a boiling kettle fills the background. She hums along to a song playing on the radio.

                **Transcription:**
                The audio transcription mentions, "The kettle’s almost done. I can’t wait for the tea."

                **Current Frame Description:**
                The woman is now seated at the kitchen table, sipping a cup of tea. Her face lights up as she looks out the window, watching the rain pour down. The kettle from earlier is now off, and the cup she holds in her hand steams lightly. The scene feels peaceful, contrasting with the earlier rush in her movements. The background music continues, faintly heard in the background.

                """,
                'images': batch_images
            }]
        )

        # Append the frame description returned by Ollama
        frame_description = response['message']['content']
        frame_data += frame_description + "\n"
        prev_frame_data = frame_description
        print(f"Batch {i//batch_size + 1} processed: {frame_description}")

    return frame_data.strip()  # Return the collected frame data

def process_frames(video_path,transcription):
    """Extracts frames and processes them."""
    frame_dir = os.path.join(os.path.dirname(__file__), "../static/frames")
    frames = sorted(os.listdir(frame_dir), key=lambda x: int(x.split('_')[1].split('.')[0]))
    image_list = [os.path.join(frame_dir, frame) for frame in frames]

    # Process images and get the frame data
    frame_data = process_images_in_batches(image_list,transcription)
    shutil.rmtree(frame_dir)
    return frame_data  # Return the frame data
