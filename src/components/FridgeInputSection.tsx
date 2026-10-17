import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Flame,
  Clock,
  Users,
  Sparkles,
  Check,
  AlertCircle,
  FileImage,
  Trash2,
  CookingPot,
} from 'lucide-react';
import { FRIDGE_PRESETS, FridgePreset } from '../data/presets';
import { UserPreferences, InventoryItem } from '../types/fridge';
import { CameraModal } from './CameraModal';

interface FridgeInputSectionProps {
  onAnalyze: (payload: {
    image?: string;
    mimeType?: string;
    preferences: UserPreferences;
    manualInventory?: InventoryItem[];
  }) => void;
  isLoading: boolean;
  onSelectPreset?: (preset: FridgePreset) => void;
}

const APPLIANCE_OPTIONS = [
  '瓦斯爐/平底鍋',
  '氣炸鍋',
  '微波爐',
  '烤箱',
  '電鍋',
  '無火/涼拌',
];

const DIET_OPTIONS = [
  '均衡家常',
  '增肌高蛋白',
  '低碳減醣',
  '清淡少油',
  '蔬食/蛋奶素',
  '快速便當',
];

const TIME_OPTIONS = [10, 15, 20, 30, 45];
const SERVING_OPTIONS = [1, 2, 4];

export const FridgeInputSection: React.FC<FridgeInputSectionProps> = ({
  onAnalyze,
  isLoading,
  onSelectPreset,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>('household-classic');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to Household classic preset initially
  const initialPreset = FRIDGE_PRESETS[0];

  const [preferences, setPreferences] = useState<UserPreferences>({
    appliances: initialPreset.defaultPreferences.appliances,
    diet: initialPreset.defaultPreferences.diet,
    time_limit_minutes: initialPreset.defaultPreferences.time_limit_minutes,
    servings: initialPreset.defaultPreferences.servings,
    special_notes: initialPreset.defaultPreferences.special_notes,
  });

  const [activePresetInventory, setActivePresetInventory] = useState<InventoryItem[] | null>(
    initialPreset.inventory
  );

  const [inputError, setInputError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setInputError(null);
    if (!file.type.startsWith('image/')) {
      setInputError('請上傳圖片格式檔案 (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(',')[1];
      setSelectedImage(base64Data);
      setMimeType(file.type);
      setImagePreviewUrl(resultStr);
      setActivePresetId(null);
      setActivePresetInventory(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetClick = (preset: FridgePreset) => {
    setInputError(null);
    setActivePresetId(preset.id);
    setSelectedImage(null);
    setImagePreviewUrl(preset.sampleSvg);
    setActivePresetInventory(preset.inventory);
    setPreferences({
      appliances: preset.defaultPreferences.appliances,
      diet: preset.defaultPreferences.diet,
      time_limit_minutes: preset.defaultPreferences.time_limit_minutes,
      servings: preset.defaultPreferences.servings,
      special_notes: preset.defaultPreferences.special_notes,
    });
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  const toggleAppliance = (item: string) => {
    setPreferences((prev) => {
      const exists = prev.appliances.includes(item);
      if (exists) {
        if (prev.appliances.length === 1) return prev; // Keep at least one
        return { ...prev, appliances: prev.appliances.filter((a) => a !== item) };
      } else {
        return { ...prev, appliances: [...prev.appliances, item] };
      }
    });
  };

  const handleExecute = () => {
    setInputError(null);
    if (!selectedImage && (!activePresetInventory || activePresetInventory.length === 0)) {
      setInputError('請先上傳冰箱照片或點選範例庫存！');
      return;
    }

    onAnalyze({
      image: selectedImage || undefined,
      mimeType: selectedImage ? mimeType : undefined,
      preferences,
      manualInventory: !selectedImage && activePresetInventory ? activePresetInventory : undefined,
    });
  };

  return (
    <section className="bg-white rounded-3xl border border-[#ede6db] p-5 sm:p-7 lg:p-8 shadow-xs">
      {/* Step 1 & Preset Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                1
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-800">
                冰箱食材來源與多模態盤點
              </h2>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              可點擊快速載入測試庫存，或直接拍照／上傳自家冰箱真實照片
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#fcfbf9] hover:bg-[#f6f0e6] text-stone-700 border border-[#e5ddcf] shadow-2xs transition"
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>現場拍照</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#fcfbf9] hover:bg-[#f6f0e6] text-stone-700 border border-[#e5ddcf] shadow-2xs transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>上傳照片</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>
        </div>

        {/* 3 Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {FRIDGE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id && !selectedImage;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-[#fffaf2] border-amber-300 shadow-sm ring-2 ring-amber-200/50'
                    : 'bg-[#faf8f5] border-[#ede6db] hover:border-[#dfd5c7] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isSelected
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200/60'
                    }`}
                  >
                    {preset.tag}
                  </span>
                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-stone-900 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-stone-800 group-hover:text-amber-800 transition-colors">
                  {preset.title}
                </div>
                <div className="text-xs text-stone-500 mt-1 line-clamp-1 font-medium">
                  {preset.subtitle}
                </div>
                <div className="text-[11px] text-emerald-700 mt-2.5 font-semibold">
                  庫存: {preset.inventory.length} 項食材就緒
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Preview or Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className={`relative rounded-3xl overflow-hidden border-2 transition-all ${
            isDragOver
              ? 'border-amber-400 bg-amber-50/40'
              : selectedImage || imagePreviewUrl
              ? 'border-[#ede6db] bg-[#faf8f5]'
              : 'border-dashed border-[#e5ddcf] bg-[#faf8f5]/60 hover:border-amber-300 hover:bg-[#fffdfa]'
          }`}
        >
          {selectedImage || imagePreviewUrl ? (
            <div className="relative group">
              <div className="max-h-64 sm:max-h-72 w-full flex items-center justify-center bg-[#fdfbf7] p-2">
                <img
                  src={imagePreviewUrl || `data:${mimeType};base64,${selectedImage}`}
                  alt="冰箱食材預覽"
                  className="max-h-60 sm:max-h-68 w-auto rounded-2xl object-contain shadow-xs"
                />
              </div>

              {/* Status bar atop image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#ede6db] text-xs shadow-sm">
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <FileImage className="w-4 h-4 text-emerald-600" />
                  <span>
                    {selectedImage
                      ? '已載入使用者照片 · 準備執行多模態辨識'
                      : '已載入測試情境庫存影像'}
                  </span>
                </div>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreviewUrl(initialPreset.sampleSvg);
                      setActivePresetId(initialPreset.id);
                      setActivePresetInventory(initialPreset.inventory);
                    }}
                    className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清除照片</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200/80 shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-700">
                  拖曳冰箱照片至此，或點擊選擇檔案
                </p>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  支援 JPG、PNG、WEBP，亦可直接使用上方預設情境快速體驗
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Custom Chef Constraints */}
      <div className="pt-6 border-t border-[#ede6db]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-stone-800">
            主廚限制條件與偏好設定
          </h2>
          <span className="text-xs text-stone-500 font-medium">（食譜將嚴格遵守限制）</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Appliance Selection */}
          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ede6db]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>可用廚房設備（複選）</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {APPLIANCE_OPTIONS.map((appliance) => {
                const checked = preferences.appliances.includes(appliance);
                return (
                  <button
                    key={appliance}
                    type="button"
                    onClick={() => toggleAppliance(appliance)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      checked
                        ? 'bg-amber-400 text-stone-900 shadow-2xs border border-amber-300'
                        : 'bg-white text-stone-600 border border-[#e5dec9] hover:bg-[#f6f0e6]'
                    }`}
                  >
                    {appliance}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diet Preferences */}
          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ede6db]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-3">
              <CookingPot className="w-3.5 h-3.5 text-emerald-600" />
              <span>飲食偏好風格</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DIET_OPTIONS.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, diet })}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    preferences.diet === diet
                      ? 'bg-emerald-500 text-white shadow-2xs border border-emerald-600'
                      : 'bg-white text-stone-600 border border-[#e5dec9] hover:bg-[#f6f0e6]'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ede6db]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-3">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>烹飪時間上限</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {TIME_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() =>
                    setPreferences({ ...preferences, time_limit_minutes: mins })
                  }
                  className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    preferences.time_limit_minutes === mins
                      ? 'bg-rose-400 text-white shadow-2xs border border-rose-500'
                      : 'bg-white text-stone-600 border border-[#e5dec9] hover:bg-[#f6f0e6]'
                  }`}
                >
                  {mins}分
                </button>
              ))}
            </div>
            <div className="text-[11px] text-stone-500 font-semibold mt-2.5 text-center">
              最長 {preferences.time_limit_minutes} 分鐘內出餐
            </div>
          </div>

          {/* Servings */}
          <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ede6db]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-3">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>用餐人數份量</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SERVING_OPTIONS.map((srv) => (
                <button
                  key={srv}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, servings: srv })}
                  className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    preferences.servings === srv
                      ? 'bg-amber-400 text-stone-900 shadow-2xs border border-amber-300'
                      : 'bg-white text-stone-600 border border-[#e5dec9] hover:bg-[#f6f0e6]'
                  }`}
                >
                  {srv === 4 ? '3-4人' : `${srv} 人份`}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-stone-500 font-semibold mt-2.5 text-center">
              精準按人頭推算食材扣除量
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div className="mb-4">
          <input
            type="text"
            value={preferences.special_notes || ''}
            onChange={(e) =>
              setPreferences({ ...preferences, special_notes: e.target.value })
            }
            placeholder="補充特殊偏好（例如：不吃辣、不要起司、家裡有小黑胡椒、希望有湯品...）"
            className="w-full bg-[#faf8f5] border border-[#e5dec9] rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition font-medium"
          />
        </div>

        {/* Input Error Message */}
        {inputError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{inputError}</span>
          </div>
        )}

        {/* Big Action Button */}
        <button
          type="button"
          onClick={handleExecute}
          disabled={isLoading}
          className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white font-black text-base sm:text-lg shadow-md shadow-orange-300/40 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2.5">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>AI 正在進行多模態盤點與星級食譜生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-100" />
                <span>一鍵啟動：盤點食材庫存 ＆ 推薦客製食譜</span>
              </>
            )}
          </div>
        </button>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(b64, mime) => {
          setSelectedImage(b64);
          setMimeType(mime);
          setImagePreviewUrl(null);
          setActivePresetId(null);
          setActivePresetInventory(null);
        }}
      />
    </section>
  );
};
