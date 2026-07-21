/**
 * Client-side utility for compressing and resizing images using HTML Canvas.
 */

/**
 * Compresses and resizes a Base64 image URL.
 * 
 * @param base64Src The source base64 image data URL (e.g., data:image/png;base64,...)
 * @param maxWidth The maximum width for the output image. Height is scaled proportionally.
 * @param quality The JPEG compression quality between 0.1 and 1.0.
 * @returns A promise that resolves to the compressed base64 image data URL (always JPEG format).
 */
export function compressImage(
  base64Src: string,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Src;
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      // Create a canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get 2D context from canvas"));
        return;
      }

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 JPEG format with the specified quality
      try {
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}
