import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center text-sm font-bold">
            B
          </div>
          <span className="font-bold text-lg">AI Video Blender</span>
        </div>
        <Link
          href="/blend"
          className="btn-primary px-5 py-2 rounded-full text-sm font-semibold"
        >
          はじめる
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            <span className="gradient-text">AI動画</span>を
            <br />
            かけあわせる
          </h1>
          <p className="text-lg md:text-xl text-[#a0a0a0] max-w-xl mx-auto">
            TikTokでバズっているAI動画を2つ選んで、新しいブレンド動画を作成。
            スプリットスクリーン、オーバーレイ、PiPなど多彩なモードで自由にミックス。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blend"
              className="btn-primary px-8 py-4 rounded-full text-lg font-bold"
            >
              動画をブレンドする
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20">
          <FeatureCard
            icon="🎬"
            title="かんたんアップロード"
            description="2つの動画ファイルをドラッグ&ドロップするだけ。MP4、WebM対応。"
          />
          <FeatureCard
            icon="🔀"
            title="4つのブレンドモード"
            description="スプリットスクリーン、オーバーレイ、ピクチャーインピクチャー、クロスフェード。"
          />
          <FeatureCard
            icon="💾"
            title="すぐにダウンロード"
            description="ブラウザ上で処理完結。ブレンド動画をWebM形式でダウンロード。"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[#a0a0a0] border-t border-white/5">
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
    <div className="card-gradient rounded-2xl p-6 text-left">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-[#a0a0a0]">{description}</p>
    </div>
  );
}
