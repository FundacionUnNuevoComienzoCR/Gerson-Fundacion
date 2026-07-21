/**
 * Utility functions for handling Google Drive and external image links.
 */

/**
 * Extracts the file ID from various Google Drive share/view URL formats and returns
 * a direct link suitable for standard <img> tags.
 * 
 * Supported URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/uc?id=FILE_ID
 * - Raw FILE_ID (if pasted directly)
 */
export function getDirectDriveImageUrl(url: string): string {
  if (!url) return "";

  const trimmed = url.trim();

  // If it's already a direct lh3.googleusercontent or drive.googleusercontent url, return as is
  if (trimmed.includes("googleusercontent.com/d/")) {
    return trimmed;
  }

  // 1. Try to extract from /file/d/FILE_ID format
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // 2. Try to extract from id=FILE_ID query parameter
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  // 3. Try to match an inline path segments for drive/folders/etc. if needed
  // 4. If it looks like a direct Google Drive ID itself (typically 28 to 44 chars, no slashes or dots)
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  // If it is any other external URL, return it unchanged
  return trimmed;
}

/**
 * Checks if a given string is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("drive.google.com") || url.includes("docs.google.com") || /^[a-zA-Z0-9_-]{33,44}$/.test(url.trim());
}
