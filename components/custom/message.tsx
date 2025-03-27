"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { TavilySearchResult } from "./tavily-search-result";
import { Weather } from "./weather";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "flex-row-reverse justify-start" : "flex-row"} gap-4 px-4 w-full first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className={`size-[30px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 ${isUser ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800"}`}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} max-w-[60%]`}>
        {content && typeof content === "string" && (
          <div className={`text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 p-3 rounded-lg ${
            isUser 
            ? "bg-blue-100 dark:bg-blue-900/30" 
            : "bg-zinc-100 dark:bg-zinc-800"
          }`}>
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className={`flex flex-col gap-4 w-full ${isUser ? "items-end" : "items-start"}`}>
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "tavilySearch" ? (
                      <TavilySearchResult searchResult={result} />
                    ) : toolName === "webScrape" ? (
                      <div className="prose dark:prose-invert max-w-full break-words">
                        <h3>Web Extraction Result</h3>
                        {result.error ? (
                          <p className="text-red-500">{result.error}</p>
                        ) : result.results && result.results.length > 0 ? (
                          <>
                            <p>{result.results[0].content || "No content extracted"}</p>
                            <p className="text-sm text-gray-500">Source: {result.results[0].url}</p>
                          </>
                        ) : (
                          <p>No content could be extracted from the URL</p>
                        )}
                      </div>
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "tavilySearch" ? (
                      <div className="skeleton-bg p-4 rounded-md">
                        <div className="h-6 w-3/4 skeleton-div rounded mb-2"></div>
                        <div className="h-4 w-full skeleton-div rounded mb-1"></div>
                        <div className="h-4 w-full skeleton-div rounded mb-1"></div>
                        <div className="h-4 w-1/2 skeleton-div rounded"></div>
                      </div>
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className={`flex flex-row gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
