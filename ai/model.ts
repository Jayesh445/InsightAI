import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from "ai";
import { google } from "@ai-sdk/google";

// custom provider with defaultSettingsMiddleware:
export const model = customProvider({
  languageModels: {
    fast: google("gemini-2.0-flash-001"),
    writing: google("gemini-2.0-pro-exp-02-05"),
    reasoning: wrapLanguageModel({
      model: google("gemini-2.0-flash-thinking-exp-01-21"),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerMetadata: {
            google: {
              thinking: { type: "enabled", budgetTokens: 12000 },
            },
          },
        },
      }),
    }),
  },
});



import {  extractReasoningMiddleware } from 'ai';

export const thinkingModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-thinking-exp-01-21",{useSearchGrounding:true}),
  middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

