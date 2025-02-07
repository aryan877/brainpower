export default function bunnyImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Replace this with your Bunny CDN URL
  const BUNNY_CDN_URL =
    process.env.NEXT_PUBLIC_BUNNY_CDN_URL ||
    "https://your-bunny-cdn-url.b-cdn.net";

  // If the source is already a full URL, return it as is
  if (src.startsWith("http")) {
    return src;
  }

  // Remove leading slash if present
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;

  // Construct the Bunny CDN URL with width and quality parameters
  return `${BUNNY_CDN_URL}/${cleanSrc}?width=${width}&quality=${quality || 75}`;
}
