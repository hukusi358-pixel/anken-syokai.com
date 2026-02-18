"use client";

import { useCallback, useRef, useState } from "react";

interface VideoUploaderProps {
  label: string;
  accent: "pink" | "cyan";
  videoUrl: string | null;
  onVideoSelect: (file: File) => void;
}

export default function VideoUploader({
  label,
  accent,
  videoUrl,
  onVideoSelect,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const accentColor = accent === "pink" ? "#fe2c55" : "#25f4ee";
  const glowClass = accent === "pink" ? "glow-pink" : "glow-cyan";

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onVideoSelect(file);
      }
    },
    [onVideoSelect]
  );

  return (
    <div className="flex flex-col gap-3">
      <h3
        className="text-sm font-bold uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {label}
      </h3>
      {videoUrl ? (
        <div className={`relative rounded-xl overflow-hidden ${glowClass}`}>
          <video
            src={videoUrl}
            className="w-full aspect-[9/16] max-h-[400px] object-cover bg-black"
            controls
            muted
            playsInline
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/90 transition"
          >
            変更
          </button>
        </div>
      ) : (
        <div
          className={`upload-zone rounded-xl flex flex-col items-center justify-center aspect-[9/16] max-h-[400px] cursor-pointer ${
            dragOver ? "drag-over" : ""
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: `${accentColor}15` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: accentColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p className="text-sm text-[#a0a0a0] mb-1">
            動画をドラッグ&ドロップ
          </p>
          <p className="text-xs text-[#666]">またはクリックして選択</p>
          <p className="text-xs text-[#555] mt-3">MP4, WebM対応</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
