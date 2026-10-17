import React, { useState } from 'react';
import {
  Package,
  Edit3,
  TrendingDown,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { InventoryItem, RemainingInventorySummaryItem } from '../types/fridge';
import { InventoryEditModal } from './InventoryEditModal';

interface InventoryCardProps {
  inventory: InventoryItem[];
  remainingSummary?: RemainingInventorySummaryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  onReRecommendWithInventory: () => void;
  isRegenerating?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  蔬菜類: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  肉品海鮮: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  蛋豆製品: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  '乳製品/飲料': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  水果類: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  '加工/其他': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
};

export const InventoryCard: React.FC<InventoryCardProps> = ({
  inventory,
  remainingSummary,
  onUpdateInventory,
  onReRecommendWithInventory,
  isRegenerating,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Map remaining by name
  const remainingMap = new Map<string, RemainingInventorySummaryItem>();
  if (remainingSummary) {
    remainingSummary.forEach((r) => remainingMap.set(r.name, r));
  }

  return (
    <div className="bg-white rounded-3xl border border-[#ede6db] p-5 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#ede6db]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              已盤點食材庫存與動態扣除明細
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              共 {inventory.length} 項
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            多模態辨識出的量化庫存，右側展示推薦食譜烹飪後的扣除狀態
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#faf8f5] hover:bg-[#f5ede2] text-stone-700 border border-[#e5ddcf] shadow-2xs transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>手動校正食材</span>
          </button>

          <button
            type="button"
            onClick={onReRecommendWithInventory}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="以目前庫存重新推薦新菜單"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>重新配菜</span>
          </button>
        </div>
      </div>

      {/* Grid of Inventory Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {inventory.map((item, idx) => {
          const color =
            CATEGORY_COLORS[item.category] || {
              bg: 'bg-stone-50',
              text: 'text-stone-700',
              border: 'border-stone-200',
            };

          const summary = remainingMap.get(item.name);
          const totalDeducted = summary?.total_deducted ?? 0;
          const remaining = summary?.remaining_quantity ?? item.quantity;
          const isFullyUsed = totalDeducted > 0 && remaining === 0;
          const isPartiallyUsed = totalDeducted > 0 && remaining > 0;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isFullyUsed
                  ? 'bg-[#fff5f5] border-rose-200 shadow-2xs'
                  : isPartiallyUsed
                  ? 'bg-[#fffdf2] border-amber-200 shadow-2xs'
                  : 'bg-[#faf8f5] border-[#ede6db] hover:border-[#dfd5c7] hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                  <span>{item.name}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                >
                  {item.category}
                </span>
              </div>

              {/* Quantity stats */}
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="text-stone-500 font-medium">盤點庫存:</span>
                <span className="font-extrabold text-stone-800">
                  {item.quantity} {item.unit}
                </span>
              </div>

              {/* Deduction Indicator */}
              <div className="pt-2.5 border-t border-[#ede6db] flex items-center justify-between text-xs">
                {isFullyUsed ? (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                    <TrendingDown className="w-3 h-3" />
                    已耗盡 (用罄 0 {item.unit})
                  </span>
                ) : isPartiallyUsed ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                    <TrendingDown className="w-3 h-3" />
                    扣除 {totalDeducted} · 剩餘 {remaining} {item.unit}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-stone-500 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    未消耗 · 充足留存
                  </span>
                )}

                {item.notes && (
                  <span className="text-[10px] text-stone-400 font-medium truncate max-w-[100px]" title={item.notes}>
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <InventoryEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        inventory={inventory}
        onSave={onUpdateInventory}
      />
    </div>
  );
};
