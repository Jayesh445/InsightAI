import { tool } from "ai";
import z from "zod";
import { GoogleGenAI,createPartFromUri } from "@google/genai";

// Type definition for PDF processing result
type PDFProcessingResult = {
  success: boolean;
  summary?: string;
  error?: string;
};

// PDF processing function
export async function processPDFWithGemini(
  file: File, 
  prompt?: string
): Promise<PDFProcessingResult> {
  try {
    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: "AIzaSyARWDCN4g9Opqs934EWGbmUZwYu9VaLhrA" });

    // Upload file
    const uploadedFile = await ai.files.upload({
      file,
      config: {
        displayName: file.name || 'uploaded_document.pdf',
      },
    });

    // Wait for file processing
    let getFile = await ai.files.get({ name: uploadedFile.displayName });
    while (getFile.state === 'PROCESSING') {
      getFile = await ai.files.get({ name: uploadedFile.displayName });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Check for processing failure
    if (getFile.state === 'FAILED') {
      return { 
        success: false, 
        error: 'File processing failed' 
      };
    }

    // Prepare analysis prompt
    const content = [
      prompt || `Provide a comprehensive analysis of this document including:
      1. Detailed Executive Summary
      2. Core Key Points
      3. Critical Insights
      4. Potential Strategic Implications
      
      Format the response in a clear, structured manner.`,
    ];

    // Add file to content if successfully processed
    const fileContent = getFile.uri 
      ? createPartFromUri(getFile.uri, getFile.mimeType || 'application/pdf')
      : null;
    
    if (fileContent) {
      content.push(fileContent);
    }

    // Generate comprehensive analysis
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: content,
    });

    return {
      success: true,
      summary: response.text()
    };

  } catch (error) {
    console.error('PDF Processing Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// PDF processing tool for AI SDK
export const pdfProcessingTool = tool({
  description: "Process PDF files to generate summaries and insights.",
  parameters: z.object({
    pdfUrl: z.string().url(),
    prompt: z.string().optional().default("Provide a comprehensive summary of this PDF document")
  }),
  execute: async (args) => {
    try {
      const { pdfUrl, prompt } = args;
      console.log("executing it ....")

      // Fetch the PDF file from the URL
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], "document.pdf", { type: blob.type });

      // Process the PDF using Gemini
      const result = await processPDFWithGemini(file, prompt);

      if (!result.success) {
        throw new Error(result.error || "Failed to process PDF");
      }

      return result.summary;
    } catch (error) {
      console.error("Error in PDF processing tool:", error);
      return `Failed to process the PDF: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
});

// Export for use in route file
export default pdfProcessingTool;