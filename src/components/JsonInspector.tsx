import React, { useState } from 'react';
import { Copy, Check, Download, CheckCircle2, Terminal } from 'lucide-react';

interface JsonInspectorProps {
  data: any;
}

export const JsonInspector: React.FC<JsonInspectorProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Filter to the strict requested structure
  const strictOutput = {
    detected_inventory: data?.detected_inventory || [],
    recipes: data?.recipes || [],
  };

  const jsonString = JSON.stringify(strictOutput, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_fridge_inventory_recipes_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#ede6db] p-5 sm:p-7 shadow-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#ede6db]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              繁體中文標準 JSON 輸出
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              無任何 Markdown 雜訊
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-1">
            包含 detected_inventory 與 recipes（含扣除清單 deduct_list），可供 API 整合或直接串接
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#faf8f5] hover:bg-[#f5ede2] text-stone-700 border border-[#e5ddcf] shadow-2xs transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">已複製 JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>複製標準 JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載 .json</span>
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-2xl bg-[#faf8f5] border border-[#ede6db] overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#f4efe6] border-b border-[#e8dfd3] text-[11px] font-semibold text-stone-600">
          <span>application/json</span>
          <span>
            {strictOutput.detected_inventory.length} 項食材 · {strictOutput.recipes.length} 道料理
          </span>
        </div>

        <pre className="p-4 overflow-x-auto text-stone-800 leading-relaxed max-h-[600px] select-all font-medium">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
