"use client";

import { BlendMode, BlendOptions } from "@/lib/videoBlender";

interface BlendControlsProps {
  options: BlendOptions;
  onChange: (options: BlendOptions) => void;
  compact?: boolean;
}

const BLEND_MODES: { value: BlendMode; label: string; icon: string }[] = [
  { value: "split", label: "スプリット", icon: "◧" },
  { value: "overlay", label: "オーバーレイ", icon: "◉" },
  { value: "pip", label: "PiP", icon: "▣" },
  { value: "crossfade", label: "クロスフェード", icon: "⇄" },
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
  compact = false,
}: BlendControlsProps) {
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Blend Mode - horizontal scroll */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0a0a0] mb-2 block">
            モード
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-container">
            {BLEND_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onChange({ ...options, mode: mode.value })}
                className={`flex-shrink-0 min-h-[44px] px-4 py-2 rounded-xl text-center transition-all ${
                  options.mode === mode.value
                    ? "bg-gradient-to-br from-[#fe2c55]/30 to-[#7c3aed]/30 border border-[#fe2c55]/50"
                    : "card-gradient"
                }`}
              >
                <div className="text-base leading-none mb-1">{mode.icon}</div>
                <div className="text-[10px] font-semibold whitespace-nowrap">
                  {mode.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific compact controls */}
        {options.mode === "split" && (
          <div className="flex gap-3 items-end">
            <div className="flex gap-1">
              {(["vertical", "horizontal"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() =>
                    onChange({ ...options, splitDirection: dir })
                  }
                  className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold transition ${
                    options.splitDirection === dir
                      ? "bg-[#25f4ee] text-black"
                      : "card-gradient"
                  }`}
                >
                  {dir === "vertical" ? "左右" : "上下"}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.01"
                value={options.splitRatio}
                onChange={(e) =>
                  onChange({
                    ...options,
                    splitRatio: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan"
              />
            </div>
          </div>
        )}

        {options.mode === "overlay" && (
          <div>
            <label className="text-[10px] text-[#a0a0a0] mb-1 block">
              透明度 {Math.round(options.opacity * 100)}%
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
              className="w-full accent-pink"
            />
          </div>
        )}

        {options.mode === "pip" && (
          <div className="flex gap-3 items-end">
            <div className="grid grid-cols-2 gap-1">
              {PIP_POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() =>
                    onChange({ ...options, pipPosition: pos.value })
                  }
                  className={`min-h-[32px] px-2 rounded text-[10px] font-semibold transition ${
                    options.pipPosition === pos.value
                      ? "bg-[#25f4ee] text-black"
                      : "card-gradient"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-[#a0a0a0] mb-1 block">
                サイズ {Math.round(options.pipScale * 100)}%
              </label>
              <input
                type="range"
                min="0.15"
                max="0.5"
                step="0.01"
                value={options.pipScale}
                onChange={(e) =>
                  onChange({
                    ...options,
                    pipScale: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-purple"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0] mb-3 block">
          ブレンドモード
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BLEND_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onChange({ ...options, mode: mode.value })}
              className={`p-3 rounded-xl text-left transition-all min-h-[44px] ${
                options.mode === mode.value
                  ? "bg-gradient-to-br from-[#fe2c55]/20 to-[#7c3aed]/20 border border-[#fe2c55]/50"
                  : "card-gradient hover:border-white/10"
              }`}
            >
              <div className="font-semibold text-sm">
                {mode.icon} {mode.label}
              </div>
            </button>
          ))}
        </div>
      </div>

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
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
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
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
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
              className="w-full accent-cyan"
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
            className="w-full accent-pink"
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
                  className={`py-2 rounded-lg text-sm font-semibold transition min-h-[44px] ${
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
              className="w-full accent-purple"
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
