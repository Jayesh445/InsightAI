import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { model, thinkingModel } from "@/ai/model";
import { processVideoWithGemini } from "@/ai/video";
import z from "zod";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-pro-exp-02-05", { useSearchGrounding: true }),
    // model:thinkingModel,
   
    messages,
    tools:{
     video_processing: tool({
        
        description: "Process video files to generate summaries and insights.",
        parameters: z.object({
          videoUrl: z.string().url(),
          prompt: z.string().optional().default("Provide a comprehensive summary of this video")
        }),
        execute: async (args) => {
          try {
            const { videoUrl, prompt } = args;
            
            // Fetch the video file from the URL
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const file = new File([blob], "video.mp4", { type: blob.type });
            
            // Process the video using Gemini
            const result = await processVideoWithGemini(file, prompt);
            
            if (!result.success) {
              throw new Error(result.error || "Failed to process video");
            }
            
            return result.summary;
          } catch (error) {
            console.error("Error in video processing tool:", error);
            return `Failed to process the video: ${error instanceof Error ? error.message : "Unknown error"}`;
          }
        }
      }),
    }
  });

  return result.toDataStreamResponse({
    sendSources: true,
    // sendReasoning: true,
  });
}