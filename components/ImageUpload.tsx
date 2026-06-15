"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ value, onChange, maxFiles = 10 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleUpload = useCallback(
    (result: any) => {
      if (result.event === "success" && result.info?.secure_url) {
        const newImages = [...value, result.info.secure_url];
        if (newImages.length <= maxFiles) {
          onChange(newImages);
          toast.success("图片上传成功");
        } else {
          toast.error(`最多只能上传 ${maxFiles} 张图片`);
        }
      }
    },
    [value, onChange, maxFiles]
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [value, onChange]
  );

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newImages = [...value];
    const [draggedItem] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, draggedItem);

    onChange(newImages);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {value.map((image, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            className={cn(
              "relative group w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50",
              dragIndex === index && "opacity-50",
              "cursor-move"
            )}
          >
            <Image
              src={image}
              alt={`上传图片 ${index + 1}`}
              fill
              className="object-cover"
              sizes="128px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <GripVertical className="w-6 h-6 text-white" />
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                封面
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
            onUpload={handleUpload}
            options={{
              maxFiles: maxFiles - value.length,
              sources: ["local", "url", "camera"],
              multiple: true,
              clientAllowedFormats: ["image"],
              maxFileSize: 10000000,
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className={cn(
                  "w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500",
                  "flex flex-col items-center justify-center gap-2 transition-colors",
                  "bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                )}
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">添加图片</span>
                <span className="text-xs">
                  {value.length}/{maxFiles}
                </span>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      <p className="text-sm text-gray-500">
        <Upload className="w-4 h-4 inline mr-1" />
        拖拽图片可调整顺序，第一张为封面图。支持 JPG、PNG 格式，单张不超过 10MB
      </p>
    </div>
  );
}
