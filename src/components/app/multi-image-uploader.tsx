'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, DragEvent, useRef, useEffect } from 'react';
import { Button } from '../ui/button';

type UploaderSlotProps = {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  previewUrl: string | null;
  isLoading: boolean;
  title: string;
};

function UploaderSlot({ onImageSelect, onImageRemove, previewUrl, isLoading, title }: UploaderSlotProps) {
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
  
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onImageRemove();
  }

  return (
    <Card
      className={cn(
        'group aspect-video w-full transition-all duration-300 overflow-hidden relative',
        isDragging && 'border-primary ring-2 ring-primary shadow-lg',
        'bg-card/50 backdrop-blur-sm'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFilePicker}
    >
      <CardHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-2">
        <CardTitle className="text-sm text-center font-medium text-white/90">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative p-0 h-full w-full flex items-center justify-center cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={`${title} preview`}
              fill
              className={cn(
                'object-contain transition-transform duration-300 group-hover:scale-105',
                isLoading && 'blur-sm'
              )}
            />
             <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 z-20 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground transition-colors group-hover:text-primary pt-8">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p className="font-semibold text-center">Click or drag to upload</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type MultiImageUploaderProps = {
  onImagesChange: (files: (File | null)[]) => void;
  isLoading: boolean;
};

export function MultiImageUploader({ onImagesChange, isLoading }: MultiImageUploaderProps) {
    const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
    const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);

    useEffect(() => {
        onImagesChange(files);
        const newPreviews = files.map(file => file ? URL.createObjectURL(file) : null);
        setPreviews(newPreviews);

        // Cleanup
        return () => {
            newPreviews.forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [files, onImagesChange]);

    const handleSelect = (file: File, index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = file;
            return newFiles;
        });
    };
    
    const handleRemove = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = null;
            return newFiles;
        });
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UploaderSlot 
                title="Higher Timeframe (e.g., Daily)"
                previewUrl={previews[0]}
                isLoading={isLoading}
                onImageSelect={(file) => handleSelect(file, 0)}
                onImageRemove={() => handleRemove(0)}
            />
            <UploaderSlot 
                title="Medium Timeframe (e.g., 4H)"
                previewUrl={previews[1]}
                isLoading={isLoading}
                onImageSelect={(file) => handleSelect(file, 1)}
                onImageRemove={() => handleRemove(1)}
            />
            <UploaderSlot 
                title="Lower Timeframe (e.g., 15M)"
                previewUrl={previews[2]}
                isLoading={isLoading}
                onImageSelect={(file) => handleSelect(file, 2)}
                onImageRemove={() => handleRemove(2)}
            />
        </div>
    );
}
