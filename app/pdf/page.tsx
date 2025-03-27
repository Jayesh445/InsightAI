"use client";

import { useState } from 'react';
import { 
  processPDFWithGemini, 
  chatWithPDFContext, 
  generatePDFEmbeddings 
} from '@/ai/pdf';

export default function PDFChatComponent() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfContext, setPdfContext] = useState<string>('');
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [embeddings, setEmbeddings] = useState<number[] | null>(null);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      
      // Process the PDF
      const processResult = await processPDFWithGemini(file);
      
      if (processResult.success && processResult.summary) {
        setPdfContext(processResult.summary);
      }

      // Generate embeddings
      const embeddingResult = await generatePDFEmbeddings(file);
      
      if (embeddingResult.success && embeddingResult.embeddings) {
        setEmbeddings(embeddingResult.embeddings.values);
      }
    }
  };

  const handleChatSubmit = async () => {
    if (pdfContext && userQuery) {
      // Include PDF file for additional context if needed
      const result = await chatWithPDFContext(
        pdfContext, 
        userQuery, 
        pdfFile || undefined
      );
      
      if (result.success && result.response) {
        setChatResponse(result.response);
        // Optionally update the context for continuity
        setPdfContext(prevContext => prevContext + '\n' + result.response);
      }
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handlePDFUpload} 
      />
      
      {pdfContext && (
        <div>
          <textarea 
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask a question about the PDF"
          />
          <button onClick={handleChatSubmit}>
            Ask Question
          </button>
        </div>
      )}

      {chatResponse && (
        <div>
          <h3>AI Response:</h3>
          <p>{chatResponse}</p>
        </div>
      )}

      {embeddings && (
        <div>
          <h3>PDF Embeddings:</h3>
          <p>Generated {embeddings.length} embedding values</p>
        </div>
      )}
    </div>
  );
}