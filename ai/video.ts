import { GoogleGenerativeAI } from "@google/generative-ai";
// import { loadEnvConfig } from '@next/env'
 
// const projectDir = process.cwd()
// loadEnvConfig(projectDir)

// Ensure you have the GEMINI_API_KEY in your .env file
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY! || 'AIzaSyARWDCN4g9Opqs934EWGbmUZwYu9VaLhrA';

// Function to process video and get initial summary
export async function processVideoWithGemini(videoFile: File, initialPrompt: string = "Provide a comprehensive summary of this video") {
  // Validate inputs
  if (!API_KEY) {
    throw new Error('Gemini API Key is not configured');
  }

  if (!videoFile) {
    throw new Error('No video file provided');
  }

  // Convert video file to base64
  const videoBytes = await fileToBase64(videoFile);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    // Generate content from video
    const result = await model.generateContent([
      initialPrompt,
      {
        inlineData: {
          data: videoBytes,
          mimeType: videoFile.type
        }
      }
    ]);

    // Return the generated text
    return {
      summary: result.response.text(),
      success: true
    };
  } catch (error) {
    console.error('Video processing error:', error);
    return {
      summary: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to continue conversation about the video
export async function chatWithVideoContext(previousContext: string, userQuery: string) {
  // Validate inputs
  if (!API_KEY) {
    throw new Error('Gemini API Key is not configured');
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    // Generate response considering previous context
    const result = await model.generateContent([
      previousContext,
      userQuery
    ]);

    // Return the generated text
    return {
      response: result.response.text(),
      success: true
    };
  } catch (error) {
    console.error('Conversation error:', error);
    return {
      response: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Utility function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}