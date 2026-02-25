import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-xs sm:text-sm font-bold">
            B
          </div>
          <span className="font-bold text-sm sm:text-lg">
            AI Video Blender
          </span>
        </div>
        <Link
          href="/blend"
          className="btn-primary px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold min-h-[44px] flex items-center"
        >
          はじめる
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-12 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight">
            <span className="gradient-text">AI動画</span>を
            <br />
            かけあわせる
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#a0a0a0] max-w-xl mx-auto">
            TikTokでバズっているAI動画を2つ選んで、新しいブレンド動画を作成。
            スプリットスクリーン、オーバーレイ、PiPなど多彩なモードで自由にミックス。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/blend"
              className="btn-primary px-8 py-4 rounded-full text-base sm:text-lg font-bold min-h-[52px] flex items-center justify-center"
            >
              動画をブレンドする
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-12 sm:mt-20 w-full">
          <FeatureCard
            icon="🎬"
            title="かんたんアップロード"
            description="2つの動画ファイルをタップで選択。MP4、WebM対応。"
          />
          <FeatureCard
            icon="🔀"
            title="4つのブレンドモード"
            description="スプリットスクリーン、オーバーレイ、ピクチャーインピクチャー、クロスフェード。"
          />
          <FeatureCard
            icon="💾"
            title="すぐにダウンロード"
            description="ブラウザ上で処理完結。ブレンド動画をそのままダウンロード。"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 sm:py-6 text-xs sm:text-sm text-[#a0a0a0] border-t border-white/5">
        TikTok AI Video Blender
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card-gradient rounded-2xl p-5 sm:p-6 text-left flex sm:flex-col gap-4 sm:gap-0 items-start">
      <div className="text-2xl sm:text-3xl sm:mb-3 flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#a0a0a0]">{description}</p>
      </div>
    </div>
  );
}
