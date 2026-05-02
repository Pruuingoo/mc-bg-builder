"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";

interface UseDropzoneOptions {
  onFile: (file: File, dataUrl: string) => void;
  onError: (msg: string) => void;
}

export function useDropzone({ onFile, onError }: UseDropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError("Please select an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => onFile(file, url);
        img.onerror = () => onError("Could not load image.");
        img.src = url;
      };
      reader.onerror = () => onError("Failed to read file.");
      reader.readAsDataURL(file);
    },
    [onFile, onError]
  );

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = "";
  };
  const open = () => inputRef.current?.click();

  return { isDragging, inputRef, onDragOver, onDragLeave, onDrop, onChange, open };
}
