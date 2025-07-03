'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, DragEvent, useRef } from 'react';

type ImageUploaderProps = {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  isLoading: boolean;
};

export function ImageUploader({
  onImageSelect,
  previewUrl,
  isLoading,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onImageSelect(e.dataTransfer.files[0]);
      }
    },
    [onImageSelect]
  );

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <Card
      className={cn(
        'group aspect-video w-full transition-all duration-300 overflow-hidden',
        isDragging && 'border-primary ring-2 ring-primary shadow-lg',
        'bg-card/50 backdrop-blur-sm'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFilePicker}
    >
      <CardContent className="relative p-0 h-full w-full flex items-center justify-center cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {isLoading ? (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 text-primary">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="mt-4 text-lg font-medium">Analyzing...</p>
          </div>
        ) : null}

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Chart preview"
            fill
            className={cn(
              'object-contain transition-transform duration-300 group-hover:scale-105',
              isLoading && 'blur-sm scale-105'
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground transition-colors group-hover:text-primary">
            <Upload className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">Upload Chart Image</p>
            <p>Drag & drop or click to select a file</p>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-primary transition-opacity duration-300 opacity-0 group-hover:opacity-100',
            isLoading && 'opacity-0',
            previewUrl && 'opacity-0 group-hover:opacity-100'
          )}
        >
          <Upload className="w-12 h-12 mb-2" />
          <p className="font-semibold">{previewUrl ? 'Change Image' : 'Upload Image'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
