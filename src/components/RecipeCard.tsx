import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Users,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UtensilsCrossed,
  Lightbulb,
  Check,
} from 'lucide-react';
import { Recipe } from '../types/fridge';

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onReplaceRequest: (recipe: Recipe) => void;
  isReplacing?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  index,
  onReplaceRequest,
  isReplacing,
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSteps, setShowSteps] = useState(true);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const progressPercent =
    recipe.steps.length > 0
      ? Math.round((completedSteps.length / recipe.steps.length) * 100)
      : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#ede6db] p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all hover:border-[#dfd5c7]">
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-200">
              #{index + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-stone-800 tracking-tight">
              {recipe.name}
            </h3>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/80 font-bold">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              <span>{recipe.cooking_time_minutes} 分鐘</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 font-bold">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>{recipe.appliances_used.join('、')}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 font-bold">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>{recipe.servings} 人份</span>
            </span>
          </div>
        </div>

        {/* Dietary tags & Flavor */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {recipe.flavor_profile && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              風味: {recipe.flavor_profile}
            </span>
          )}
          {recipe.dietary_tags?.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#faf8f5] text-stone-600 border border-[#ede6db]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5 bg-[#faf8f5] p-3.5 rounded-2xl border border-[#ede6db] font-medium">
          {recipe.description}
        </p>

        {/* Deduct List Section */}
        <div className="mb-5 bg-[#fdfcf9] p-4 rounded-2xl border border-[#ede6db]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>料理扣除用量清單 (deduct_list)</span>
            </div>
            <span className="text-[11px] text-stone-500 font-medium">嚴格限定冰箱現有量</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.deduct_list.map((item, dIdx) => (
              <div
                key={dIdx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e8dfd3] text-xs shadow-2xs"
              >
                <div className="font-bold text-stone-800">{item.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 font-mono font-bold">
                    -{item.deduct_quantity} {item.unit}
                  </span>
                  <span className="text-stone-500 text-[10px] font-medium">
                    (餘 {item.remaining_quantity})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Basic Seasonings */}
          {recipe.basic_seasonings && recipe.basic_seasonings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#ede6db] text-xs text-stone-600 font-medium">
              <span className="text-stone-800 font-bold">常備調味品（免扣庫存）：</span>
              <span className="ml-1 text-stone-600">
                {recipe.basic_seasonings.join('、')}
              </span>
            </div>
          )}
        </div>

        {/* Step-by-Step Cooking Steps */}
        <div className="mb-5">
          <div
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center justify-between cursor-pointer py-2 text-xs font-bold text-stone-800 select-none"
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>逐步料理操作導引 ({recipe.steps.length} 步驟)</span>
              {completedSteps.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  已完成 {progressPercent}%
                </span>
              )}
            </div>
            <button type="button" className="text-stone-400 hover:text-stone-700">
              {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showSteps && (
            <div className="space-y-2 mt-2">
              {recipe.steps.map((step) => {
                const isDone = completedSteps.includes(step.step_number);
                return (
                  <div
                    key={step.step_number}
                    onClick={() => toggleStep(step.step_number)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-50/70 border-emerald-200 opacity-80'
                        : 'bg-[#faf8f5] border-[#ede6db] hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-white text-stone-700 border border-[#e5dec9]'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.step_number}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isDone ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[11px] text-stone-500 font-semibold font-mono">
                          約 {step.duration_minutes} 分鐘
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 leading-relaxed font-medium ${
                          isDone ? 'line-through text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chef Tips */}
        {recipe.chef_tips && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 mb-5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>主廚提點 (Chef's Secret)</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">{recipe.chef_tips}</p>
          </div>
        )}
      </div>

      {/* Dynamic Dish Replacement Action Button */}
      <div className="pt-4 border-t border-[#ede6db] flex items-center justify-between">
        <span className="text-xs text-stone-500 font-medium">不合胃口？隨時保留庫存換一道</span>
        <button
          type="button"
          onClick={() => onReplaceRequest(recipe)}
          disabled={isReplacing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#fffdfa] hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isReplacing ? 'animate-spin' : ''}`} />
          <span>這道不要，換一道...</span>
        </button>
      </div>
    </div>
  );
};
