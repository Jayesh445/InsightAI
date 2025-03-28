import { Source } from '@/components/web';

export async function fetchWebpagePreview(url: string): Promise<Source> {
  try {
    const apiUrl = `/api/webpage-preview?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching preview for ${url}:`, error);
    // Return a minimal object if the preview fails
    return { url };
  }
}

export async function fetchWebpagePreviews(urls: string[]): Promise<Source[]> {
  return Promise.all(
    urls.map(url => fetchWebpagePreview(url))
  );
}
