"use client";

import { BlendMode, BlendOptions } from "@/lib/videoBlender";

interface BlendControlsProps {
  options: BlendOptions;
  onChange: (options: BlendOptions) => void;
}

const BLEND_MODES: { value: BlendMode; label: string; desc: string }[] = [
  {
    value: "split",
    label: "スプリット",
    desc: "画面を分割して左右（上下）に表示",
  },
  {
    value: "overlay",
    label: "オーバーレイ",
    desc: "2つの動画を透過で重ねる",
  },
  {
    value: "pip",
    label: "PiP",
    desc: "小窓で2つ目の動画を表示",
  },
  {
    value: "crossfade",
    label: "クロスフェード",
    desc: "2つの動画をサイクルで切り替え",
  },
];

const PIP_POSITIONS = [
  { value: "top-left" as const, label: "左上" },
  { value: "top-right" as const, label: "右上" },
  { value: "bottom-left" as const, label: "左下" },
  { value: "bottom-right" as const, label: "右下" },
];

export default function BlendControls({
  options,
  onChange,
}: BlendControlsProps) {
  return (
    <div className="space-y-6">
      {/* Blend Mode Selection */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-3 block">
          ブレンドモード
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BLEND_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onChange({ ...options, mode: mode.value })}
              className={`p-3 rounded-xl text-left transition-all ${
                options.mode === mode.value
                  ? "bg-gradient-to-br from-[#fe2c55]/20 to-[#7c3aed]/20 border border-[#fe2c55]/50"
                  : "card-gradient hover:border-white/10"
              }`}
            >
              <div className="font-semibold text-sm">{mode.label}</div>
              <div className="text-xs text-[#a0a0a0] mt-1">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode-specific controls */}
      {options.mode === "split" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
              分割方向
            </label>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onChange({ ...options, splitDirection: "vertical" })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  options.splitDirection === "vertical"
                    ? "bg-[#25f4ee] text-black"
                    : "card-gradient"
                }`}
              >
                左右
              </button>
              <button
                onClick={() =>
                  onChange({ ...options, splitDirection: "horizontal" })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  options.splitDirection === "horizontal"
                    ? "bg-[#25f4ee] text-black"
                    : "card-gradient"
                }`}
              >
                上下
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
              分割位置: {Math.round(options.splitRatio * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.01"
              value={options.splitRatio}
              onChange={(e) =>
                onChange({ ...options, splitRatio: parseFloat(e.target.value) })
              }
              className="w-full accent-[#25f4ee]"
            />
          </div>
        </div>
      )}

      {options.mode === "overlay" && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
            動画2の透明度: {Math.round(options.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={options.opacity}
            onChange={(e) =>
              onChange({ ...options, opacity: parseFloat(e.target.value) })
            }
            className="w-full accent-[#fe2c55]"
          />
        </div>
      )}

      {options.mode === "pip" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
              小窓の位置
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PIP_POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() =>
                    onChange({ ...options, pipPosition: pos.value })
                  }
                  className={`py-2 rounded-lg text-sm font-semibold transition ${
                    options.pipPosition === pos.value
                      ? "bg-[#25f4ee] text-black"
                      : "card-gradient"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
              小窓のサイズ: {Math.round(options.pipScale * 100)}%
            </label>
            <input
              type="range"
              min="0.15"
              max="0.5"
              step="0.01"
              value={options.pipScale}
              onChange={(e) =>
                onChange({ ...options, pipScale: parseFloat(e.target.value) })
              }
              className="w-full accent-[#7c3aed]"
            />
          </div>
        </div>
      )}

      {options.mode === "crossfade" && (
        <div className="card-gradient rounded-xl p-4">
          <p className="text-sm text-[#a0a0a0]">
            再生中に2つの動画が自動的にクロスフェードで切り替わります。
          </p>
        </div>
      )}
    </div>
  );
}
