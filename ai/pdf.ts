// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Ensure you have the GEMINI_API_KEY in your .env file
// const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'AIzaSyARWDCN4g9Opqs934EWGbmUZwYu9VaLhrA';

// // Function to process PDF and get initial summary using Gemini
// export async function processPDFWithGemini(pdfFile: File, initialPrompt: string = "Provide a comprehensive summary of this PDF document") {
//   // Validate inputs
//   if (!API_KEY) {
//     throw new Error('Gemini API Key is not configured');
//   }

//   if (!pdfFile) {
//     throw new Error('No PDF file provided');
//   }

//   try {
//     // Convert PDF file to base64
//     const pdfBase64 = await fileToBase64(pdfFile);

//     // Initialize Gemini AI
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//     // Generate content from PDF
//     const result = await model.generateContent([
//       initialPrompt,
//       {
//         inlineData: {
//           data: pdfBase64,
//           mimeType: "application/pdf"
//         }
//       }
//     ]);

//     // Return the generated text
//     return {
//       summary: result.response.text(),
//       success: true
//     };
//   } catch (error) {
//     console.error('PDF processing error:', error);
//     return {
//       summary: null,
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }

// // Function to continue conversation about the PDF with embedding and context
// export async function chatWithPDFContext(previousContext: string, userQuery: string, pdfFile?: File) {
//   // Validate inputs
//   if (!API_KEY) {
//     throw new Error('Gemini API Key is not configured');
//   }

//   // Initialize Gemini AI
//   const genAI = new GoogleGenerativeAI(API_KEY);
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//   try {
//     // Prepare the conversation context
//     let conversationInput: any[] = [previousContext, userQuery];

//     // If PDF file is provided, include it for additional context
//     if (pdfFile) {
//       const pdfBase64 = await fileToBase64(pdfFile);
//       conversationInput.push({
//         inlineData: {
//           data: pdfBase64,
//           mimeType: "application/pdf"
//         }
//       });
//     }

//     // Generate response considering previous context and optional PDF
//     const result = await model.generateContent(conversationInput);

//     // Return the generated text
//     return {
//       response: result.response.text(),
//       success: true
//     };
//   } catch (error) {
//     console.error('Conversation error:', error);
//     return {
//       response: null,
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }

// // Utility function to convert File to base64
// async function fileToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
//       const base64 = (reader.result as string).split(',')[1];
//       resolve(base64);
//     };
//     reader.onerror = error => reject(error);
//   });
// }

// // Function to generate embeddings for PDF content
// export async function generatePDFEmbeddings(pdfFile: File) {
//   // Validate inputs
//   if (!API_KEY) {
//     throw new Error('Gemini API Key is not configured');
//   }

//   try {
//     // Convert PDF file to base64
//     const pdfBase64 = await fileToBase64(pdfFile);

//     // Initialize Gemini AI
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: "gemini-embedding-exp-03-07" });

//     // Generate embeddings
//     const result = await model.embedContent({
//       content: {
//         inlineData: {
//           data: pdfBase64,
//           mimeType: "application/pdf"
//         }
//       }
//     });

//     return {
//       embeddings: result.embedding,
//       success: true
//     };
//   } catch (error) {
//     console.error('PDF embedding error:', error);
//     return {
//       embeddings: null,
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// }