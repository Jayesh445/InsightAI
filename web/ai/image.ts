import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure you have the GEMINI_API_KEY in your .env file
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyARWDCN4g9Opqs934EWGbmUZwYu9VaLhrA';

// Type definitions for image processing
interface ImageProcessingOptions {
  initialPrompt?: string;
  additionalContext?: string;
}

interface ImageProcessingResult {
  analysis: string | null;
  success: boolean;
  error?: string;
  fileType?: string;
}

interface ImageChatResult {
  response: string | null;
  success: boolean;
  error?: string;
}

// Function to process image and get initial analysis
export async function processImageWithGemini(
  imageFile: File, 
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> {
  // Validate inputs
  if (!API_KEY) {
    return {
      analysis: null,
      success: false,
      error: 'Gemini API Key is not configured'
    };
  }

  if (!imageFile) {
    return {
      analysis: null,
      success: false,
      error: 'No image file provided'
    };
  }

  try {
    // Convert image file to base64
    const imageBase64 = await fileToBase64(imageFile);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the initial prompt
    const defaultPrompt = "Provide a comprehensive analysis of this image, describing its contents, key details, and any notable characteristics.";
    const prompt = options.initialPrompt || defaultPrompt;

    // Prepare input for Gemini
    const inputContent: any[] = [
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      }
    ];

    // Add additional context if provided
    if (options.additionalContext) {
      inputContent.push(options.additionalContext);
    }

    // Generate content from image
    const result = await model.generateContent(inputContent);

    return {
      analysis: result.response.text(),
      success: true,
      fileType: imageFile.type
    };
  } catch (error) {
    console.error('Image processing error:', error);
    return {
      analysis: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to continue conversation about the image
export async function chatWithImageContext(
  previousContext: string, 
  userQuery: string, 
  imageFile?: File
): Promise<ImageChatResult> {
  // Validate inputs
  if (!API_KEY) {
    return {
      response: null,
      success: false,
      error: 'Gemini API Key is not configured'
    };
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    // Prepare the conversation input
    const conversationInput: any[] = [previousContext, userQuery];

    // If image file is provided, include it for additional context
    if (imageFile) {
      const imageBase64 = await fileToBase64(imageFile);
      conversationInput.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      });
    }

    // Generate response considering previous context and optional image
    const result = await model.generateContent(conversationInput);

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

// Utility function to extract image metadata
export function extractImageMetadata(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
}

// Utility function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}