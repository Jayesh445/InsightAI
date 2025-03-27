import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { model, thinkingModel } from "@/ai/model";
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-pro-exp-02-05", { useSearchGrounding: true }),
    // model:thinkingModel,
   
    messages,
  });

  return result.toDataStreamResponse({
    sendSources: true,
    // sendReasoning: true,
  });
}