import React, { useState, useEffect } from "react";
import { getDirectDriveImageUrl } from "../utils/drive";

interface BlurUpImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export default function BlurUpImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  ...props
}: BlurUpImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  const resolvedSrc = getDirectDriveImageUrl(src);

  useEffect(() => {
    if (!resolvedSrc) {
      setIsLoaded(false);
      setCurrentSrc("");
      return;
    }

    // Reset state on source changes
    setIsLoaded(false);
    
    // Create an image object to pre-cache / trigger the load event
    const img = new Image();
    img.src = resolvedSrc;
    img.onload = () => {
      setCurrentSrc(resolvedSrc);
      setIsLoaded(true);
    };
    img.onerror = () => {
      // If error, display raw source or handle fallback gracefully
      setCurrentSrc(resolvedSrc);
      setIsLoaded(true);
    };
  }, [resolvedSrc]);

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-950/40 rounded-[inherit] ${containerClassName}`}>
      {/* Pulse skeleton background while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 bg-[length:200%_100%] animate-pulse" />
      )}

      {/* Actual Image */}
      {resolvedSrc && (
        <img
          src={currentSrc || resolvedSrc}
          alt={alt}
          className={`transition-all duration-700 ease-out ${
            isLoaded 
              ? "blur-0 scale-100 opacity-100" 
              : "blur-md scale-95 opacity-40"
          } ${className}`}
          referrerPolicy="no-referrer"
          {...props}
        />
      )}
    </div>
  );
}
