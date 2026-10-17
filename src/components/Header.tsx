import React from 'react';
import { ChefHat, Refrigerator, Sparkles, Code2, Eye } from 'lucide-react';

interface HeaderProps {
  activeTab: 'visual' | 'json';
  setActiveTab: (tab: 'visual' | 'json') => void;
  hasResult: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasResult,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-[#ede6db] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onReset}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 shadow-md shadow-orange-500/20 text-white transition-transform duration-200 group-hover:scale-105">
            <Refrigerator className="w-5 h-5 absolute -translate-x-1 -translate-y-1 opacity-80" />
            <ChefHat className="w-5 h-5 translate-x-1 translate-y-1 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-stone-800 tracking-tight">
                智慧冰箱主廚核心系統
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
                多模態盤點 · 嚴格無添加
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              拍照辨識庫存 · 設備限制客製食譜 · 精準扣除用量 · 支援動態換菜
            </p>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasResult && (
            <div className="flex bg-[#f2ede4] p-1 rounded-2xl border border-[#e5ddcf]">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'visual'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>主廚面板</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'json'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                <span>標準 JSON</span>
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white/80 px-3 py-1.5 rounded-2xl border border-[#ede6db] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Gemini 3.8 Core</span>
          </div>
        </div>
      </div>
    </header>
  );
};
