import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { InventoryItem } from '../types/fridge';

interface InventoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSave: (updated: InventoryItem[]) => void;
}

const CATEGORIES = [
  '蔬菜類',
  '肉品海鮮',
  '蛋豆製品',
  '乳製品/飲料',
  '水果類',
  '加工/其他',
];

export const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSave,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(() =>
    JSON.parse(JSON.stringify(inventory))
  );

  const [newItem, setNewItem] = useState<InventoryItem>({
    name: '',
    quantity: 1,
    unit: '顆',
    category: '蔬菜類',
    notes: '手動新增',
  });

  if (!isOpen) return null;

  const handleUpdate = (index: number, field: keyof InventoryItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setItems([...items, { ...newItem, quantity: Number(newItem.quantity) || 1 }]);
    setNewItem({
      name: '',
      quantity: 1,
      unit: '顆',
      category: '蔬菜類',
      notes: '手動新增',
    });
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#ede6db] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fdfbf7] border-b border-[#ede6db]">
          <div>
            <h3 className="text-base font-bold text-stone-800">校正與管理冰箱食材庫存</h3>
            <p className="text-xs text-stone-500 font-medium">可自由增刪食材或修正 AI 推估的數量與單位</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-xl hover:bg-[#f2ede4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-2xl bg-[#faf8f5] border border-[#ede6db]"
            >
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                placeholder="食材名稱"
                className="flex-1 bg-white border border-[#e5dec9] rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-400 font-medium"
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdate(idx, 'quantity', parseFloat(e.target.value) || 0)
                  }
                  className="w-18 bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-800 text-center focus:outline-none focus:border-amber-400 font-bold"
                />

                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleUpdate(idx, 'unit', e.target.value)}
                  placeholder="單位"
                  className="w-16 bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-800 text-center focus:outline-none focus:border-amber-400 font-medium"
                />

                <select
                  value={item.category}
                  onChange={(e) => handleUpdate(idx, 'category', e.target.value)}
                  className="bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-amber-400 font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-stone-400 hover:text-rose-500 p-1.5 transition cursor-pointer"
                  title="刪除食材"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Quick Add Form */}
          <form
            onSubmit={handleAddNew}
            className="flex flex-col sm:flex-row items-center gap-2 p-3.5 rounded-2xl bg-amber-50/50 border border-dashed border-amber-300"
          >
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="新增食材名稱 (如：洋蔥、豆腐)"
              className="flex-1 bg-white border border-[#e5dec9] rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-400 font-medium"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })
                }
                className="w-18 bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-800 text-center font-bold"
              />
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="單位"
                className="w-16 bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-800 text-center font-medium"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="bg-white border border-[#e5dec9] rounded-xl px-2 py-1.5 text-xs text-stone-700 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>加入</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#fdfbf7] border-t border-[#ede6db]">
          <span className="text-xs text-stone-500 font-medium">目前共 {items.length} 項食材</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>確認保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
