import os

def get_frames(video_path):
    """Extract frames from the video."""
    frames_folder = os.path.join(os.path.dirname(__file__), "../static/frames")
    os.makedirs(frames_folder, exist_ok=True)
    os.system(f'ffmpeg -i "{video_path}" -vf "fps=0.67" "{os.path.join(frames_folder, "frame_%04d.jpeg")}"')

def get_audio(video_path):
    """Extract audio from the video."""
    audio_folder = os.path.join(os.path.dirname(__file__), "../static/audio")
    os.makedirs(audio_folder, exist_ok=True)
    os.system(f'ffmpeg -i "{video_path}" -vn "{os.path.join(audio_folder, "output.wav")}"')
