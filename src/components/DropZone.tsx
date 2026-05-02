"use client";

import React from "react";
import { useDropzone } from "@/lib/useDropzone";
import styles from "./DropZone.module.css";

interface Props {
  label: string;
  hint: string;
  icon: React.ReactNode;
  previewAspect?: "video" | "square";
  onFile: (file: File, dataUrl: string) => void;
  onClear: () => void;
  dataUrl: string | null;
  error: string | null;
}

export function DropZone({
  label,
  hint,
  icon,
  previewAspect = "video",
  onFile,
  onClear,
  dataUrl,
  error,
}: Props) {
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const { isDragging, inputRef, onDragOver, onDragLeave, onDrop, onChange } =
    useDropzone({
      onFile: (f, u) => {
        setErrMsg(null);
        onFile(f, u);
      },
      onError: (m) => setErrMsg(m),
    });

  const displayError = error || errMsg;

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>{label}</div>

      {!dataUrl ? (
        <div
          className={`${styles.zone} ${isDragging ? styles.over : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label={`Upload ${label}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            className={styles.input}
          />
          <div className={styles.zoneIcon}>{icon}</div>
          <div className={styles.zoneTitle}>DROP OR CLICK</div>
          <div className={styles.zoneSub}>{hint}</div>
        </div>
      ) : (
        <div
          className={`${styles.preview} ${
            previewAspect === "square" ? styles.square : styles.video
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="preview" className={styles.previewImg} />
          <div className={styles.previewBadge}>{label.toUpperCase()}</div>
          <button
            className={styles.removeBtn}
            onClick={onClear}
            type="button"
            aria-label="Remove image"
          >
            ✕ REMOVE
          </button>
        </div>
      )}

      {displayError && <div className={styles.error}>⚠ {displayError}</div>}
    </div>
  );
}
