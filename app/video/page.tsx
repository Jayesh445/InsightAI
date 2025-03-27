"use client";

import { useState } from 'react';
import { processVideoWithGemini, chatWithVideoContext } from '@/ai/video';

export default function VideoChatComponent() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoContext, setVideoContext] = useState<string>('');
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      
      // Process the video
      const result = await processVideoWithGemini(file);
      
      if (result.success && result.summary) {
        setVideoContext(result.summary);
      }
    }
  };

  const handleChatSubmit = async () => {
    if (videoContext && userQuery) {
      const result = await chatWithVideoContext(videoContext, userQuery);
      
      if (result.success && result.response) {
        setChatResponse(result.response);
        // Optionally update the context for continuity
        setVideoContext(prevContext => prevContext + '\n' + result.response);
      }
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleVideoUpload} 
      />
      
      {videoContext && (
        <div>
          <textarea 
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask a question about the video"
          />
          <button onClick={handleChatSubmit}>
            Ask Question
          </button>
        </div>
      )}

      {chatResponse && (
        <div>
          <h3>AI Response:</h3>
          <p>{chatResponse}</p>
        </div>
      )}
    </div>
  );
}