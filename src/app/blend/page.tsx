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

type MobileStep = "upload" | "settings" | "preview";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "video/webm";
}

export default function BlendPage() {
  const isMobile = useIsMobile();
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [video1Url, setVideo1Url] = useState<string | null>(null);
  const [video2Url, setVideo2Url] = useState<string | null>(null);
  const [options, setOptions] = useState<BlendOptions>(defaultBlendOptions);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<MobileStep>("upload");
  const [hasMediaRecorder, setHasMediaRecorder] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Lower resolution on mobile for performance
  const CANVAS_WIDTH = isMobile ? 360 : 720;
  const CANVAS_HEIGHT = isMobile ? 640 : 1280;

  useEffect(() => {
    setHasMediaRecorder(typeof MediaRecorder !== "undefined");
  }, []);

  useEffect(() => {
    if (!video1Ref.current) {
      const v = document.createElement("video");
      v.playsInline = true;
      v.muted = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      v.setAttribute("webkit-playsinline", "true");
      video1Ref.current = v;
    }
    if (!video2Ref.current) {
      const v = document.createElement("video");
      v.playsInline = true;
      v.muted = true;
      v.loop = true;
      v.crossOrigin = "anonymous";
      v.setAttribute("webkit-playsinline", "true");
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

    drawBlendedFrame(
      ctx,
      v1,
      v2,
      canvas.width,
      canvas.height,
      options,
      progress
    );

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [options, isPlaying]);

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

    v1.currentTime = 0;
    v2.currentTime = 0;
    await Promise.all([v1.play(), v2.play()]);
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    const stream = canvas.captureStream(30);
    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: isMobile ? 2500000 : 5000000,
    });

    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
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

    const duration = Math.min(v1.duration || 10, v2.duration || 10, 60);
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, duration * 1000);
  }, [isRecording, isMobile]);

  const handleDownload = useCallback(() => {
    if (!recordedUrl) return;
    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `blended-video-${Date.now()}.webm`;
    a.click();
  }, [recordedUrl]);

  const bothVideosReady = !!video1File && !!video2File;

  // Auto-advance to settings on mobile when both videos are ready
  useEffect(() => {
    if (bothVideosReady && mobileStep === "upload" && isMobile) {
      setMobileStep("settings");
    }
  }, [bothVideosReady, mobileStep, isMobile]);

  // ──────────────────────────────────────
  // MOBILE LAYOUT
  // ──────────────────────────────────────
  if (isMobile) {
    return (
      <main className="min-h-[100dvh] flex flex-col bg-[#0a0a0a]">
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-xs font-bold">
              B
            </div>
            <span className="font-bold text-sm">AI Video Blender</span>
          </Link>
          {/* Step indicator */}
          <div className="flex gap-1.5 items-center">
            {(["upload", "settings", "preview"] as const).map((step) => (
              <div
                key={step}
                className={`step-dot ${mobileStep === step ? "active" : ""}`}
              />
            ))}
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex-1 scroll-container overflow-y-auto">
          {/* STEP: Upload */}
          {mobileStep === "upload" && (
            <div className="p-4 space-y-4">
              <h2 className="text-lg font-bold text-center">
                AI動画を2つ選択
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <VideoUploader
                  label="動画 1"
                  accent="pink"
                  videoUrl={video1Url}
                  onVideoSelect={handleVideo1Select}
                  compact
                />
                <VideoUploader
                  label="動画 2"
                  accent="cyan"
                  videoUrl={video2Url}
                  onVideoSelect={handleVideo2Select}
                  compact
                />
              </div>
              {bothVideosReady && (
                <button
                  onClick={() => setMobileStep("settings")}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-sm min-h-[48px]"
                >
                  次へ: ブレンド設定
                </button>
              )}
            </div>
          )}

          {/* STEP: Settings */}
          {mobileStep === "settings" && (
            <div className="p-4 space-y-4">
              {/* Mini thumbnails */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setMobileStep("upload")}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center card-gradient rounded-lg"
                >
                  <svg
                    className="w-5 h-5 text-[#a0a0a0]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="flex gap-2 flex-1 justify-center">
                  {video1Url && (
                    <video
                      src={video1Url}
                      className="w-12 h-12 rounded-lg object-cover glow-pink"
                      muted
                      playsInline
                    />
                  )}
                  <div className="flex items-center text-[#a0a0a0] text-lg">
                    +
                  </div>
                  {video2Url && (
                    <video
                      src={video2Url}
                      className="w-12 h-12 rounded-lg object-cover glow-cyan"
                      muted
                      playsInline
                    />
                  )}
                </div>
                <div className="w-11" /> {/* spacer for centering */}
              </div>

              <h2 className="text-lg font-bold text-center">ブレンド設定</h2>
              <BlendControls options={options} onChange={setOptions} compact />

              <button
                onClick={() => setMobileStep("preview")}
                className="btn-primary w-full py-3 rounded-xl font-bold text-sm min-h-[48px]"
              >
                プレビューへ
              </button>
            </div>
          )}

          {/* STEP: Preview */}
          {mobileStep === "preview" && (
            <div className="p-4 space-y-4 pb-32">
              {/* Back + edit */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMobileStep("settings")}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center card-gradient rounded-lg"
                >
                  <svg
                    className="w-5 h-5 text-[#a0a0a0]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h2 className="flex-1 text-lg font-bold flex items-center">
                  プレビュー
                </h2>
              </div>

              {/* Canvas */}
              <div className="relative mx-auto" style={{ maxWidth: "100%" }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="blend-canvas w-full bg-black/50 rounded-xl"
                />
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold">REC</span>
                  </div>
                )}
              </div>

              {/* Download result */}
              {recordedUrl && (
                <div className="card-gradient rounded-xl p-4 text-center space-y-3">
                  <p className="font-bold gradient-text">ブレンド完了!</p>
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full rounded-lg"
                    playsInline
                  />
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full py-3 rounded-xl font-bold text-sm min-h-[48px]"
                  >
                    ダウンロード
                  </button>
                </div>
              )}

              {!hasMediaRecorder && (
                <div className="card-gradient rounded-xl p-4 text-center">
                  <p className="text-sm text-[#a0a0a0]">
                    このブラウザでは録画機能が利用できません。
                    Chrome/Firefoxをお試しください。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        {mobileStep === "preview" && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5 bottom-sheet px-4 pt-3">
            <div className="flex gap-2">
              <button
                onClick={handlePlay}
                className={`flex-1 py-3 rounded-xl font-bold text-sm min-h-[48px] transition-all ${
                  isPlaying ? "bg-white/10 active:bg-white/20" : "btn-secondary"
                }`}
              >
                {isPlaying ? "停止" : "再生"}
              </button>
              {hasMediaRecorder && (
                <button
                  onClick={handleRecord}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm min-h-[48px] transition-all ${
                    isRecording
                      ? "bg-red-600 active:bg-red-700 animate-pulse-glow"
                      : "btn-primary"
                  }`}
                >
                  {isRecording ? "録画停止" : "録画"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  // ──────────────────────────────────────
  // DESKTOP LAYOUT (unchanged)
  // ──────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-sm font-bold">
            B
          </div>
          <span className="font-bold text-lg">AI Video Blender</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-row">
        {/* Left Panel */}
        <aside className="w-80 xl:w-96 p-6 border-r border-white/5 overflow-y-auto space-y-6">
          <h2 className="text-xl font-bold">動画を選択</h2>
          <div className="space-y-4">
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
          {bothVideosReady && (
            <>
              <hr className="border-white/5" />
              <BlendControls options={options} onChange={setOptions} />
            </>
          )}
        </aside>

        {/* Main Canvas */}
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
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handlePlay}
                  className={`px-6 py-3 rounded-full font-bold transition-all min-h-[44px] ${
                    isPlaying
                      ? "bg-white/10 hover:bg-white/20"
                      : "btn-secondary"
                  }`}
                >
                  {isPlaying ? "停止" : "プレビュー再生"}
                </button>
                {hasMediaRecorder && (
                  <button
                    onClick={handleRecord}
                    className={`px-6 py-3 rounded-full font-bold transition-all min-h-[44px] ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700 animate-pulse-glow"
                        : "btn-primary"
                    }`}
                  >
                    {isRecording ? "録画停止" : "ブレンド動画を録画"}
                  </button>
                )}
              </div>
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
                    className="btn-primary px-8 py-3 rounded-full font-bold w-full min-h-[44px]"
                  >
                    ダウンロード (.webm)
                  </button>
                </div>
              )}
              {!hasMediaRecorder && (
                <div className="card-gradient rounded-xl p-4 text-center max-w-sm">
                  <p className="text-sm text-[#a0a0a0]">
                    このブラウザでは録画機能が利用できません。
                    Chrome/Firefoxをお試しください。
                  </p>
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
