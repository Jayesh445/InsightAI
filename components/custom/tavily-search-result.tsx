"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilySearchResponse {
  query: string;
  answer: string;
  results: SearchResult[];
  response_time: string;
}

export function TavilySearchResult({
  searchResult,
}: {
  searchResult: TavilySearchResponse;
}) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-md w-full">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-medium">Search: &quot;{searchResult.query}&quot;</div>

        <div className="prose dark:prose-invert max-w-full">
          <p>{searchResult.answer}</p>
        </div>

        <div className="text-sm text-zinc-500">
          Results found in {searchResult.response_time}s
        </div>
      </div>

      {searchResult.results && searchResult.results.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <button 
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            Sources: ({searchResult.results.length})
            {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showSources && (
            <div className="flex flex-col gap-3">
              {searchResult.results.map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 p-3 bg-zinc-100 dark:bg-zinc-800 rounded"
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {result.title}
                  </a>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    {result.content}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new URL(result.url).hostname}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
