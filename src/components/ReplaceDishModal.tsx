import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Recipe, InventoryItem } from '../types/fridge';

interface ReplaceDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToReplace: Recipe | null;
  otherRecipes: Recipe[];
  detectedInventory: InventoryItem[];
  onConfirmReplace: (recipe: Recipe, replacementPrompt: string) => Promise<void>;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  '這道不要，換一道更清爽少油的料理',
  '這道不要，換成 15 分鐘內的快手料理',
  '這道不要，改用氣炸鍋或烤箱做',
  '這道不要，換成暖胃湯品',
  '這道不要，換成以豆腐或蛋為主的料理',
  '這道不要，想要更濃郁下飯的風味',
];

export const ReplaceDishModal: React.FC<ReplaceDishModalProps> = ({
  isOpen,
  onClose,
  recipeToReplace,
  otherRecipes,
  detectedInventory,
  onConfirmReplace,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('這道不要，換一道不同烹調手法或清爽風味的料理');

  if (!isOpen || !recipeToReplace) return null;

  // Calculate remaining available inventory for replacement
  const deductMap = new Map<string, number>();
  otherRecipes.forEach((r) => {
    r.deduct_list?.forEach((d) => {
      deductMap.set(d.name, (deductMap.get(d.name) || 0) + Number(d.deduct_quantity || 0));
    });
  });

  const availableItems = detectedInventory
    .map((item) => {
      const usedByOthers = deductMap.get(item.name) || 0;
      const left = Math.max(0, +(item.quantity - usedByOthers).toFixed(2));
      return {
        name: item.name,
        available: left,
        unit: item.unit,
      };
    })
    .filter((item) => item.available > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onConfirmReplace(recipeToReplace, prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#ede6db] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fdfbf7] border-b border-[#ede6db]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800">動態換菜支援</h3>
              <p className="text-xs text-stone-500 font-medium">保留盤點庫存，即時為您替換指定料理</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-xl hover:bg-[#f2ede4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Target Dish */}
          <div className="p-4 rounded-2xl bg-[#fff5f5] border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                即將替換的料理
              </span>
              <div className="text-sm font-bold text-stone-800 mt-0.5">
                {recipeToReplace.name}
              </div>
              <div className="text-xs text-stone-500 font-medium mt-0.5 flex items-center gap-2">
                <span>耗時 {recipeToReplace.cooking_time_minutes} 分鐘</span>
                <span>•</span>
                <span>{recipeToReplace.appliances_used.join('、')}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">
              這道不要
            </span>
          </div>

          {/* Available inventory notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>換菜可用庫存額度（已保障其他保留料理）：</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {availableItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white text-emerald-800 border border-emerald-200/80 shadow-2xs"
                >
                  {item.name} {item.available} {item.unit}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-2">
              快速指定換菜方向：
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className={`text-left p-2.5 rounded-xl text-xs transition border cursor-pointer font-medium ${
                    prompt === p
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                      : 'bg-[#faf8f5] text-stone-600 border-[#ede6db] hover:bg-white hover:border-amber-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Textarea */}
          <form onSubmit={handleSubmit} id="replace-form">
            <label className="text-xs font-bold text-stone-700 block mb-1.5">
              或填寫具體換菜要求：
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：這道不要，換成一道可以用氣炸鍋做的高蛋白料理..."
              className="w-full bg-[#faf8f5] border border-[#ede6db] rounded-2xl p-3 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition resize-none font-medium"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fdfbf7] border-t border-[#ede6db]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer"
          >
            取消
          </button>

          <button
            type="submit"
            form="replace-form"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-300/30 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>主廚正在重新研發新菜色...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>立即替換該道菜</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
