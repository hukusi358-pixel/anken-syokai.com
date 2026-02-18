"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import VideoUploader from "@/components/VideoUploader";
import BlendControls from "@/components/BlendControls";
import {
  BlendOptions,
  defaultBlendOptions,
  drawBlendedFrame,
} from "@/lib/videoBlender";

export default function BlendPage() {
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [video1Url, setVideo1Url] = useState<string | null>(null);
  const [video2Url, setVideo2Url] = useState<string | null>(null);
  const [options, setOptions] = useState<BlendOptions>(defaultBlendOptions);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const CANVAS_WIDTH = 720;
  const CANVAS_HEIGHT = 1280;

  // Create hidden video elements
  useEffect(() => {
    if (!video1Ref.current) {
      const v = document.createElement("video");
      v.playsInline = true;
      v.muted = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      video1Ref.current = v;
    }
    if (!video2Ref.current) {
      const v = document.createElement("video");
      v.playsInline = true;
      v.muted = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      video2Ref.current = v;
    }
  }, []);

  const handleVideo1Select = useCallback((file: File) => {
    setVideo1File(file);
    const url = URL.createObjectURL(file);
    setVideo1Url(url);
    if (video1Ref.current) {
      video1Ref.current.src = url;
      video1Ref.current.load();
    }
    setRecordedUrl(null);
  }, []);

  const handleVideo2Select = useCallback((file: File) => {
    setVideo2File(file);
    const url = URL.createObjectURL(file);
    setVideo2Url(url);
    if (video2Ref.current) {
      video2Ref.current.src = url;
      video2Ref.current.load();
    }
    setRecordedUrl(null);
  }, []);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!canvas || !v1 || !v2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const duration = Math.max(v1.duration || 10, v2.duration || 10);
    const progress = (elapsed % duration) / duration;

    drawBlendedFrame(ctx, v1, v2, CANVAS_WIDTH, CANVAS_HEIGHT, options, progress);

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [options, isPlaying]);

  // Re-trigger rendering loop when renderFrame changes
  useEffect(() => {
    if (isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, renderFrame]);

  const handlePlay = useCallback(async () => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1?.src || !v2?.src) return;

    if (isPlaying) {
      setIsPlaying(false);
      v1.pause();
      v2.pause();
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    try {
      v1.currentTime = 0;
      v2.currentTime = 0;
      await Promise.all([v1.play(), v2.play()]);
      startTimeRef.current = Date.now();
      setIsPlaying(true);
    } catch (err) {
      console.error("Video play failed:", err);
    }
  }, [isPlaying]);

  const handleRecord = useCallback(async () => {
    const canvas = canvasRef.current;
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!canvas || !v1?.src || !v2?.src) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Start playing first
    v1.currentTime = 0;
    v2.currentTime = 0;
    await Promise.all([v1.play(), v2.play()]);
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    // Set up recording
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 5000000,
    });

    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setIsPlaying(false);
      v1.pause();
      v2.pause();
      cancelAnimationFrame(animFrameRef.current);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);

    // Auto-stop after shorter video duration (max 60s)
    const duration = Math.min(
      v1.duration || 10,
      v2.duration || 10,
      60
    );
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, duration * 1000);
  }, [isRecording]);

  const handleDownload = useCallback(() => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `blended-video-${Date.now()}.webm`;
    a.click();
  }, [recordedUrl]);

  const bothVideosReady = !!video1File && !!video2File;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-sm font-bold">
            B
          </div>
          <span className="font-bold text-lg">AI Video Blender</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel: Upload & Controls */}
        <aside className="lg:w-80 xl:w-96 p-6 border-r border-white/5 overflow-y-auto space-y-6">
          <h2 className="text-xl font-bold">動画を選択</h2>

          {/* Video Uploaders */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <VideoUploader
              label="動画 1"
              accent="pink"
              videoUrl={video1Url}
              onVideoSelect={handleVideo1Select}
            />
            <VideoUploader
              label="動画 2"
              accent="cyan"
              videoUrl={video2Url}
              onVideoSelect={handleVideo2Select}
            />
          </div>

          {/* Blend Controls */}
          {bothVideosReady && (
            <>
              <hr className="border-white/5" />
              <BlendControls options={options} onChange={setOptions} />
            </>
          )}
        </aside>

        {/* Main: Canvas Preview */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {bothVideosReady ? (
            <>
              <div className="relative w-full max-w-[405px]">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="blend-canvas w-full bg-black/50 rounded-xl"
                />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur px-3 py-1.5 rounded-full">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-bold">REC</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handlePlay}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    isPlaying
                      ? "bg-white/10 hover:bg-white/20"
                      : "btn-secondary"
                  }`}
                >
                  {isPlaying ? "停止" : "プレビュー再生"}
                </button>
                <button
                  onClick={handleRecord}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 animate-pulse-glow"
                      : "btn-primary"
                  }`}
                >
                  {isRecording ? "録画停止" : "ブレンド動画を録画"}
                </button>
              </div>

              {/* Download */}
              {recordedUrl && (
                <div className="card-gradient rounded-2xl p-6 w-full max-w-md text-center space-y-4">
                  <p className="font-bold text-lg gradient-text">
                    ブレンド完了!
                  </p>
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full rounded-xl"
                    playsInline
                  />
                  <button
                    onClick={handleDownload}
                    className="btn-primary px-8 py-3 rounded-full font-bold w-full"
                  >
                    ダウンロード (.webm)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#fe2c55]/10 to-[#25f4ee]/10 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#a0a0a0]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">2つの動画をアップロード</h2>
              <p className="text-[#a0a0a0] max-w-sm mx-auto">
                左のパネルからAI動画を2つ選択してください。
                ブレンドのプレビューがここに表示されます。
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
