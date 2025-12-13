// Google Custom Search API service
// ضع مفتاح API ومعرّف محرك البحث في ملف .env.local

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;

export async function searchGoogle(query: string) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    throw new Error("Google API key or CX is missing");
  }
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Search failed");
  const data = await res.json();
  return data.items?.map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  })) || [];
}
