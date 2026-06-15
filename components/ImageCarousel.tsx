"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({
  images,
  alt = "房源图片",
  className,
  autoPlay = false,
  interval = 5000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const goToPrev = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (autoPlay && !isHovered && images.length > 1) {
      const timer = setInterval(goToNext, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, goToNext, isHovered, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, goToNext, goToPrev]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center", className)}>
        <span className="text-gray-400">暂无图片</span>
      </div>
    );
  }

  const CarouselContent = (
    <>
      <div className="relative w-full h-full overflow-hidden">
        {images.map((src, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <Image
              src={src}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
            <div className="flex space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
            <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </>
      )}

      {!isFullscreen && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </>
  );

  return (
    <>
      <div
        className={cn(
          "relative aspect-[16/9] bg-gray-900 rounded-2xl overflow-hidden",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {CarouselContent}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex space-x-3 overflow-x-auto pb-2">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt={`缩略图 ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-8">
            {CarouselContent}
          </div>
        </div>
      )}
    </>
  );
}
