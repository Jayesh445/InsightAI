'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperclipIcon, SendIcon, XIcon, BrainCircuitIcon, VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [videoProcessing, setVideoProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const removeFile = (index: number) => {
    if (!files) return;
    
    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    
    setFiles(dt.files.length > 0 ? dt.files : undefined);
    
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  const handleVideoProcessing = async () => {
    if (!files) return;
    
    // Find the first video file
    const videoFile = Array.from(files).find(file => file.type.startsWith('video/'));
    
    if (!videoFile) {
      alert("No video files selected. Please upload a video file.");
      return;
    }
    
    try {
      setVideoProcessing(true);
      
      // Create a temporary object URL for the video file
      const videoUrl = URL.createObjectURL(videoFile);
      
      // Get user prompt if provided, otherwise use default
      const userPrompt = input.trim() || "Provide a comprehensive summary of this video";
      
      // Add the user's prompt and video URL as a message
      // The format enables the AI to recognize and use the video_processing tool
      await append({
        role: 'user',
        content: `${userPrompt}\n\nVideo URL: ${videoUrl}`,
      });
      
      // Clear the input and files
      setInput("");
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Scroll to bottom
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
      }, 100);
      
      // Note: We don't need to manually append the AI response 
      // as it will come through the normal chat interface
    } catch (error) {
      console.error("Video processing error:", error);
      alert("Error processing video: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setVideoProcessing(false);
    }
  };

  // Check if any files are videos
  const hasVideoFiles = files ? Array.from(files).some(file => file.type.startsWith('video/')) : false;

  return (
    <div className="flex flex-col w-full max-w-3xl min-h-[85vh] h-full p-4 mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">InsightAI Chatbot</h1>
        <p className="text-muted-foreground mt-1">
          Powerful AI assistant with web searching and video analyzing capability
        </p>
      </div>
      
      <Card className="flex-1 overflow-hidden border shadow-sm">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[calc(85vh-140px)] md:h-[calc(85vh-120px)]"
        >
          <div className="p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-6 text-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <BrainCircuitIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-xl">How can I help you today?</h3>
                <p className="text-sm">Start a conversation with the AI assistant. You can also attach files for analysis.</p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map(m => (
                  <Card 
                    key={m.id} 
                    className={`overflow-hidden border-0 shadow-sm ${
                      m.role === 'user' ? 'bg-primary/5' : 'bg-secondary/5'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarFallback className={m.role === 'user' ? 'bg-primary/10' : 'bg-secondary/20'}>
                            {m.role === 'user' ? 'U' : 'AI'}
                          </AvatarFallback>
                          {m.role !== 'user' && (
                            <AvatarImage src="/ai-avatar.png" alt="AI" />
                          )}
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="font-medium text-sm">
                            {m.role === 'user' ? 'You' : 'AI Assistant'}
                          </div>
                          
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {m.role === 'assistant' ? (
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                            ) : (
                              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                            )}
                          </div>
                          
                          {/* Display sources if available */}
                          {m.parts && m.parts.filter(part => part.type === "source").length > 0 && (
                            <div className="mt-3 pt-2 border-t border-dashed border-muted">
                              <span className="text-xs font-medium">Sources:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {m.parts
                                  .filter(part => part.type === "source")
                                  .map((part, index) => (
                                    <Button 
                                      key={`source-${part.source.id || index}`} 
                                      variant="outline" 
                                      size="sm"
                                      asChild
                                      className="h-auto py-1 text-xs"
                                    >
                                      <a 
                                        href={part.source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                      >
                                        {part.source.title || new URL(part.source.url).hostname}
                                      </a>
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Display image attachments */}
                          {m?.experimental_attachments
                            ?.filter(attachment =>
                              attachment?.contentType?.startsWith('image/'),
                            )
                            .map((attachment, index) => (
                              <div key={`${m.id}-${index}`} className="mt-3 rounded-md overflow-hidden border">
                                <Image
                                  src={attachment.url}
                                  width={500}
                                  height={500}
                                  className="w-full h-auto max-h-[300px] object-contain"
                                  alt={attachment.name ?? `attachment-${index}`}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-pulse flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animation-delay-200"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animation-delay-500"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="mt-4 border shadow-sm">
        <CardContent className="p-4">
          <form
            className="flex flex-col gap-3"
            onSubmit={event => {
              handleSubmit(event, {
                experimental_attachments: files,
              });

              setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              
              // Scroll to bottom after sending
              setTimeout(() => {
                scrollAreaRef.current?.scrollTo({ top: 999999, behavior: 'smooth' });
              }, 100);
            }}
          >
            {/* File attachment preview */}
            {files && files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from(files).map((file, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className={`pl-2 pr-1 py-1 gap-1 items-center ${file.type.startsWith('video/') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    {file.type.startsWith('video/') && <VideoIcon className="h-3 w-3 mr-1" />}
                    {file.name.length > 20 ? `${file.name.substring(0, 17)}...` : file.name}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 ml-1 p-0 hover:bg-muted" 
                      onClick={() => removeFile(i)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Video processing button */}
            {hasVideoFiles && (
              <Button
                type="button"
                variant="outline"
                className="mb-2"
                onClick={handleVideoProcessing}
                disabled={videoProcessing || isLoading}
              >
                {videoProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                    Processing video...
                  </>
                ) : (
                  <>
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Analyze Video with AI
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              
              <Input
                type="file"
                className="hidden"
                onChange={event => {
                  if (event.target.files && event.target.files.length > 0) {
                    setFiles(event.target.files);
                  }
                }}
                multiple
                ref={fileInputRef}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              
              <div className="flex-1 relative">
                <Input
                  className="pr-12 py-5 h-10"
                  value={input}
                  placeholder={hasVideoFiles ? "Enter prompt for video analysis or type a message..." : "Type a message..."}
                  onChange={handleInputChange}
                  disabled={isLoading || videoProcessing}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  disabled={!input && (!files || files.length === 0) || isLoading || videoProcessing}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}