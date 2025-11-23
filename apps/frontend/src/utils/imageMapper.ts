/**
 * Image URL mappings - Convert Figma URLs to local image paths
 * All images are stored locally in /public/images
 */

export const imageMap: Record<string, string> = {
  // User default image
  "290490a2-5396-4f24-97ea-74c38365d0e9": "/images/default-image.png",

  // User profile images
  "fe3aad0c-1c04-41cd-9ffa-725ef1c483b6": "/images/image-1.png",

  // Map image
  "1ede7ea0-7e0c-4915-bb90-bb9a4bcc49e5": "/images/map-image.png",

  // Vectors
  "91636383-9b42-436d-b2c8-f460e654377a": "/images/vector.png",
  "21456f3d-7309-4435-9d98-85b64264d593": "/images/vector-1.png",
  "17325962-5fde-4cd0-873b-d78ea088b73c": "/images/vector-2.png",
  "7c5e6a34-4138-455f-9811-3cef886a43fc": "/images/vector-3.png",

  // Ellipses (map markers & UI elements)
  "15a8cdde-bd45-46bd-9a6a-4a443c719b15": "/images/ellipse-1.png",
  "8d737b67-199c-42be-9d1c-4dc5c43b079b": "/images/ellipse-2.png",
  "cc8fe8de-31f7-43fb-ad11-87265528d4d2": "/images/ellipse-8.png",
  "03550ac2-1210-439a-bf0d-b82a96307284": "/images/ellipse-7.png",
  "051eac42-6e3d-4589-a0fe-14a92c291351": "/images/ellipse-3.png",
  "d921f7b1-3642-4aa1-a761-1202cc99ce83": "/images/ellipse-5.png",
  "8fce0ca8-dfee-4c9c-8d83-84f036f80e1d": "/images/ellipse-6.png",

  // Icons
  "048c86ff-e79d-4483-8859-702d8db23cdb": "/images/icon.png",
  "d06002c0-215c-4ee9-8f0f-676445a616fc": "/images/icon-1.png",
  "4f6da687-3b39-4f18-b901-674f8b56eb8f": "/images/icon-2.png",
  "6e8aa37e-5765-43ab-8729-7774f326405a": "/images/icon-3.png",
  "671bcbbd-ed89-4e21-8c04-0f17add86636": "/images/icon-4.png",
};

/**
 * Convert Figma asset URL to local image path
 * @param figmaUrl - Original Figma URL
 * @returns Local image path or original URL if not found
 */
export function getLocalImagePath(figmaUrl: string): string {
  // Extract UUID from Figma URL
  const match = figmaUrl.match(/asset\/([a-f0-9\-]+)/);
  if (match && match[1]) {
    const uuid = match[1];
    return imageMap[uuid] || figmaUrl;
  }
  return figmaUrl;
}

/**
 * Get image URL (prefers local, falls back to Figma)
 * For offline-first approach
 */
export function getImageUrl(
  figmaUrl: string,
  useLocal: boolean = true
): string {
  if (useLocal) {
    return getLocalImagePath(figmaUrl);
  }
  return figmaUrl;
}
