'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Source {
  id?: string;
  title?: string;
  url: string;
  snippet?: string;
  imageUrl?: string;
  favicon?: string;
}

interface WebSourcePreviewProps {
  sources: Source[];
  loading?: boolean;
}

export const WebSourcePreview = ({ sources, loading = false }: WebSourcePreviewProps) => {
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  
  if (loading) {
    return <SourcesSkeleton count={4} />;
  }
  
  if (!sources || sources.length === 0) return null;
  
  const toggleExpand = (sourceId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };

  const handleImageLoad = (sourceId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [sourceId]: false
    }));
  };

  const handleImageLoadStart = (sourceId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [sourceId]: true
    }));
  };

  return (
    <div className="space-y-3 mt-4 pt-3 border-t">
      <h3 className="text-sm font-medium text-muted-foreground">Web Sources ({sources.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source, index) => {
          const sourceId = source.id || `source-${index}`;
          const isExpanded = !!expandedSources[sourceId];
          const isImageLoading = !!imageLoading[sourceId];
          const hasLongSnippet = source.snippet && source.snippet.length > 100;
          
          return (
            <Card key={sourceId} className="overflow-hidden border shadow-sm">
              <div className="relative w-full h-28 bg-muted">
                {source.imageUrl && (
                  <>
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton className="w-full h-full" />
                      </div>
                    )}
                    <Image
                      src={source.imageUrl}
                      fill
                      alt={source.title || "Source image"}
                      className="object-cover"
                      onLoadStart={() => handleImageLoadStart(sourceId)}
                      onLoad={() => handleImageLoad(sourceId)}
                      onError={(e) => {
                        handleImageLoad(sourceId);
                        // Replace with placeholder on error
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Preview';
                      }}
                    />
                  </>
                )}
                {!source.imageUrl && (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    No preview available
                  </div>
                )}
              </div>
              
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  {source.favicon ? (
                    <div className="h-5 w-5 shrink-0 mt-0.5">
                      <Image
                        src={source.favicon}
                        width={20}
                        height={20}
                        alt="Site favicon"
                        className="h-5 w-5 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 shrink-0 mt-0.5 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{source.title?.charAt(0) || 'W'}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm line-clamp-1">{source.title || new URL(source.url).hostname}</h4>
                    <p className="text-xs text-muted-foreground truncate">{new URL(source.url).hostname}</p>
                  </div>
                </div>
                
                {source.snippet ? (
                  <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {source.snippet}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No description available</p>
                )}
              </CardContent>
              
              <CardFooter className="p-3 pt-0 flex justify-between items-center">
                {hasLongSnippet && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => toggleExpand(sourceId)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUpIcon className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-3 w-3 mr-1" />
                        Show more
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 ${!hasLongSnippet ? 'ml-auto' : ''} text-xs`}
                  asChild
                >
                  <a 
                    href={source.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit
                    <ExternalLinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const SourcesSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="space-y-3 mt-4 pt-3 border-t">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden border">
            <Skeleton className="h-28 w-full" />
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Skeleton className="h-7 w-20 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
