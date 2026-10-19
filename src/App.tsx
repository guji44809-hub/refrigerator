/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { FridgeInputSection } from './components/FridgeInputSection';
import { InventoryCard } from './components/InventoryCard';
import { RecipeCard } from './components/RecipeCard';
import { JsonInspector } from './components/JsonInspector';
import { ReplaceDishModal } from './components/ReplaceDishModal';
import {
  FridgeAnalysisResult,
  UserPreferences,
  InventoryItem,
  Recipe,
} from './types/fridge';
import {
  AlertCircle,
  Utensils,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [result, setResult] = useState<FridgeAnalysisResult | null>(null);
  const [lastPreferences, setLastPreferences] = useState<UserPreferences>({
    appliances: ['瓦斯爐/平底鍋'],
    diet: '均衡家常',
    time_limit_minutes: 20,
    servings: 2,
    special_notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Dish Replacement State
  const [replaceTargetRecipe, setReplaceTargetRecipe] = useState<Recipe | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Analyze and recommend recipes
  const handleAnalyze = async (payload: {
    image?: string;
    mimeType?: string;
    preferences: UserPreferences;
    manualInventory?: InventoryItem[];
  }) => {
    setIsLoading(true);
    setError(null);
    setLastPreferences(payload.preferences);

    try {
      const res = await fetch('/api/fridge/analyze-and-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: payload.image,
          mimeType: payload.mimeType,
          preferences: payload.preferences,
          manualInventory: payload.manualInventory,
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        if (res.status === 404) {
          throw new Error('找不到後端 API (404)。請確認已部署 api/index.ts 與 vercel.json。');
        } else if (res.status === 504) {
          throw new Error('雲端函式運算逾時 (504)，請稍候再次點擊嘗試。');
        } else {
          throw new Error(`伺服器回應格式異常 (HTTP ${res.status})`);
        }
      }

      if (!res.ok) {
        throw new Error(json?.error || '辨識與食譜推薦失敗');
      }

      setResult(json.data);
      showToast('🎉 食材盤點與主廚食譜推薦生成成功！');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '連線異常，請檢查網路或稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Dynamic Dish Replacement ("動態換菜支援")
  const handleConfirmReplace = async (
    targetRecipe: Recipe,
    replacementPrompt: string
  ) => {
    if (!result) return;
    setIsReplacing(true);
    setError(null);

    try {
      // Find the recipes to keep
      const otherRecipes = result.recipes.filter((r) => r.id !== targetRecipe.id);

      const res = await fetch('/api/fridge/replace-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detected_inventory: result.detected_inventory,
          recipes_to_keep: otherRecipes,
          recipe_to_replace: targetRecipe,
          replacement_prompt: replacementPrompt,
          preferences: lastPreferences,
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        if (res.status === 404) {
          throw new Error('找不到換菜 API (404)。');
        } else {
          throw new Error(`換菜回應異常 (HTTP ${res.status})`);
        }
      }

      if (!res.ok) {
        throw new Error(json?.error || '換菜失敗');
      }

      setResult(json.data);
      setReplaceTargetRecipe(null);
      showToast(`✨ 成功將【${targetRecipe.name}】替換為【${json.data.replaced_recipe?.name || '新推薦料理'}】！`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '換菜失敗，請重試');
    } finally {
      setIsReplacing(false);
    }
  };

  // 3. Update Inventory manually
  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    if (!result) return;
    setResult({
      ...result,
      detected_inventory: newInventory,
    });
    showToast('庫存已更新，可點擊「重新配菜」以新庫存生成菜單。');
  };

  // 4. Re-recommend with current inventory
  const handleReRecommend = () => {
    if (!result) return;
    handleAnalyze({
      manualInventory: result.detected_inventory,
      preferences: lastPreferences,
    });
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setActiveTab('visual');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResult={!!result}
        onReset={handleReset}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">
              <span className="font-bold">系統提示：</span> {error}
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
            >
              關閉
            </button>
          </div>
        )}

        {/* Input & Constraints Section */}
        <FridgeInputSection
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onSelectPreset={() => {
            if (result) setResult(null);
          }}
        />

        {/* Output Section */}
        {result && (
          <div className="space-y-8 pt-2">
            {/* View Mode: Visual or JSON */}
            {activeTab === 'visual' ? (
              <>
                {/* 1. Inventory Summary */}
                <InventoryCard
                  inventory={result.detected_inventory}
                  remainingSummary={result.total_remaining_inventory}
                  onUpdateInventory={handleUpdateInventory}
                  onReRecommendWithInventory={handleReRecommend}
                  isRegenerating={isLoading}
                />

                {/* 2. Recommended Recipes List */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-800">
                        客製化主廚推薦料理（嚴格限定庫存食材）
                      </h3>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      共推薦 {result.recipes.length} 道料理 · 支援單道替換
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {result.recipes.map((recipe, idx) => (
                      <RecipeCard
                        key={recipe.id || idx}
                        recipe={recipe}
                        index={idx}
                        onReplaceRequest={(r) => setReplaceTargetRecipe(r)}
                        isReplacing={isReplacing}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* JSON View */
              <JsonInspector data={result} />
            )}
          </div>
        )}
      </main>

      {/* Dynamic Dish Replacement Modal */}
      <ReplaceDishModal
        isOpen={!!replaceTargetRecipe}
        onClose={() => setReplaceTargetRecipe(null)}
        recipeToReplace={replaceTargetRecipe}
        otherRecipes={result ? result.recipes.filter((r) => r.id !== replaceTargetRecipe?.id) : []}
        detectedInventory={result?.detected_inventory || []}
        onConfirmReplace={handleConfirmReplace}
        isLoading={isReplacing}
      />

      {/* Footer */}
      <footer className="border-t border-[#ede6db] bg-[#fdfbf7]/80 py-6 text-center text-xs text-stone-500">
        <p className="font-semibold text-stone-700">智慧冰箱核心系統 · 多模態食材盤點與客製化食譜推薦引擎</p>
        <p className="mt-1 text-[11px] text-stone-500">
          嚴格限定現有食材 · 精準計算 deduct_list 扣除用量 · 動態換菜庫存即時同步
        </p>
      </footer>
    </div>
  );
}
