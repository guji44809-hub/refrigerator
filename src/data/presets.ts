import { InventoryItem } from '../types/fridge';

export interface FridgePreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: string;
  themeColor: string;
  inventory: InventoryItem[];
  defaultPreferences: {
    appliances: string[];
    diet: string;
    time_limit_minutes: number;
    servings: number;
    special_notes: string;
  };
  sampleSvg: string;
}

export const FRIDGE_PRESETS: FridgePreset[] = [
  {
    id: 'household-classic',
    title: '家庭常備食材庫',
    subtitle: '番茄、雞蛋、高麗菜、嫩豆腐、青蔥、豬肉',
    tag: '經典家常',
    icon: 'CookingPot',
    themeColor: 'emerald',
    defaultPreferences: {
      appliances: ['瓦斯爐/平底鍋', '電鍋'],
      diet: '均衡家常',
      time_limit_minutes: 20,
      servings: 2,
      special_notes: '希望有一道酸甜開胃的下飯菜',
    },
    inventory: [
      { name: '牛番茄', quantity: 2, unit: '顆', category: '蔬菜類', notes: '新鮮飽滿', confidence: 'high' },
      { name: '雞蛋', quantity: 6, unit: '顆', category: '蛋豆製品', notes: '冷藏新鮮蛋', confidence: 'high' },
      { name: '高麗菜', quantity: 0.5, unit: '顆', category: '蔬菜類', notes: '半顆脆甜', confidence: 'high' },
      { name: '板豆腐', quantity: 1, unit: '盒', category: '蛋豆製品', notes: '完整盒裝', confidence: 'high' },
      { name: '青蔥', quantity: 2, unit: '根', category: '蔬菜類', notes: '翠綠鮮蔥', confidence: 'medium' },
      { name: '豬絞肉', quantity: 250, unit: '克', category: '肉品海鮮', notes: '低脂絞肉', confidence: 'high' },
    ],
    sampleSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="24" fill="%23fdfbf7"/><rect x="30" y="25" width="540" height="350" rx="20" fill="%23f7f2ea" stroke="%23e8dfd3" stroke-width="2.5"/><line x1="30" y1="140" x2="570" y2="140" stroke="%23ded4c5" stroke-width="2" stroke-dasharray="6 6"/><line x1="30" y1="250" x2="570" y2="250" stroke="%23ded4c5" stroke-width="2" stroke-dasharray="6 6"/><circle cx="100" cy="85" r="32" fill="%23ff6b6b" fill-opacity="0.92"/><text x="76" y="90" fill="white" font-size="12" font-weight="bold">🍅 牛番茄x2</text><rect x="180" y="55" width="135" height="60" rx="12" fill="%23ffd166" fill-opacity="0.95"/><text x="210" y="90" fill="%235a3e00" font-size="12" font-weight="bold">🥚 雞蛋 6顆</text><circle cx="410" cy="85" r="36" fill="%2306d6a0" fill-opacity="0.92"/><text x="375" y="90" fill="white" font-size="12" font-weight="bold">🥬 高麗菜0.5顆</text><rect x="75" y="170" width="120" height="55" rx="10" fill="%23ffffff" stroke="%23e5dec9" stroke-width="1.5"/><text x="105" y="203" fill="%2344403c" font-size="12" font-weight="bold">🧊 板豆腐 1盒</text><rect x="235" y="170" width="130" height="55" rx="10" fill="%23ff8fa3" fill-opacity="0.95"/><text x="255" y="203" fill="white" font-size="12" font-weight="bold">🥩 豬絞肉 250g</text><rect x="400" y="175" width="115" height="48" rx="10" fill="%2352b788" fill-opacity="0.95"/><text x="425" y="204" fill="white" font-size="12" font-weight="bold">🌱 青蔥 2根</text><text x="60" y="315" fill="%2378716c" font-size="14" font-weight="bold">✨ 智慧冰箱冷藏室 · 辨識定位完成（共 6 項食材）</text></svg>`,
  },
  {
    id: 'fitness-prep',
    title: '減脂增肌高蛋白庫',
    subtitle: '雞胸肉、綠花椰菜、蘑菇、胡蘿蔔、雞蛋、洋蔥',
    tag: '高蛋白健身',
    icon: 'Dumbbell',
    themeColor: 'blue',
    defaultPreferences: {
      appliances: ['氣炸鍋', '微波爐', '瓦斯爐/平底鍋'],
      diet: '增肌高蛋白',
      time_limit_minutes: 15,
      servings: 1,
      special_notes: '少油少鹽，想要快速備餐',
    },
    inventory: [
      { name: '生雞胸肉', quantity: 2, unit: '片', category: '肉品海鮮', notes: '約300克 去皮清肉', confidence: 'high' },
      { name: '綠花椰菜', quantity: 1, unit: '朵', category: '蔬菜類', notes: '緊實翠綠', confidence: 'high' },
      { name: '白蘑菇', quantity: 1, unit: '盒', category: '蔬菜類', notes: '約150克', confidence: 'high' },
      { name: '胡蘿蔔', quantity: 1, unit: '根', category: '蔬菜類', notes: '完整根莖', confidence: 'high' },
      { name: '雞蛋', quantity: 4, unit: '顆', category: '蛋豆製品', notes: '冷藏鮮蛋', confidence: 'high' },
      { name: '黃洋蔥', quantity: 1, unit: '顆', category: '蔬菜類', notes: '結實乾燥', confidence: 'high' },
    ],
    sampleSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="24" fill="%23fdfbf7"/><rect x="30" y="25" width="540" height="350" rx="20" fill="%23edf2f7" stroke="%23d8e2dc" stroke-width="2.5"/><line x1="30" y1="140" x2="570" y2="140" stroke="%23cbd5e1" stroke-width="2" stroke-dasharray="6 6"/><line x1="30" y1="250" x2="570" y2="250" stroke="%23cbd5e1" stroke-width="2" stroke-dasharray="6 6"/><rect x="75" y="60" width="140" height="60" rx="12" fill="%23fca5a5" fill-opacity="0.95"/><text x="105" y="95" fill="%237f1d1d" font-size="12" font-weight="bold">🍗 雞胸肉 2片</text><circle cx="310" cy="90" r="35" fill="%236ee7b7" fill-opacity="0.95"/><text x="275" y="95" fill="%23064e3b" font-size="12" font-weight="bold">🥦 花椰菜 1朵</text><rect x="410" y="65" width="110" height="50" rx="10" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="1.5"/><text x="430" y="95" fill="%23334155" font-size="12" font-weight="bold">🍄 蘑菇 1盒</text><rect x="75" y="170" width="115" height="52" rx="10" fill="%23fdba74" fill-opacity="0.95"/><text x="100" y="202" fill="%237c2d12" font-size="12" font-weight="bold">🥕 胡蘿蔔 1根</text><circle cx="280" cy="195" r="28" fill="%23fef08a" stroke="%23eab308" stroke-width="1.5"/><text x="252" y="200" fill="%23713f12" font-size="12" font-weight="bold">🧅 洋蔥 1顆</text><rect x="385" y="170" width="125" height="52" rx="10" fill="%23fed7aa" fill-opacity="0.95"/><text x="410" y="202" fill="%237c2d12" font-size="12" font-weight="bold">🥚 雞蛋 4顆</text><text x="60" y="315" fill="%23475569" font-size="14" font-weight="bold">💪 增肌減脂庫存 · 高蛋白低GI食材就位</text></svg>`,
  },
  {
    id: 'empty-fridge-rescue',
    title: '月底清冰箱救急庫',
    subtitle: '馬鈴薯、雞蛋、起司片、洋蔥、蒜瓣',
    tag: '剩食救援',
    icon: 'Sparkles',
    themeColor: 'amber',
    defaultPreferences: {
      appliances: ['瓦斯爐/平底鍋', '氣炸鍋'],
      diet: '均衡家常',
      time_limit_minutes: 15,
      servings: 1,
      special_notes: '簡單快速，想把剩餘馬鈴薯跟起司用完',
    },
    inventory: [
      { name: '馬鈴薯', quantity: 2, unit: '顆', category: '蔬菜類', notes: '中型 帶皮乾燥', confidence: 'high' },
      { name: '雞蛋', quantity: 2, unit: '顆', category: '蛋豆製品', notes: '僅剩最後2顆', confidence: 'high' },
      { name: '起司片', quantity: 2, unit: '片', category: '乳製品/飲料', notes: '切達起司', confidence: 'high' },
      { name: '黃洋蔥', quantity: 0.5, unit: '顆', category: '蔬菜類', notes: '切半保鮮膜包裹', confidence: 'high' },
      { name: '大蒜', quantity: 3, unit: '瓣', category: '蔬菜類', notes: '辛香料', confidence: 'medium' },
    ],
    sampleSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" rx="24" fill="%23fdfbf7"/><rect x="30" y="25" width="540" height="350" rx="20" fill="%23fef3c7" fill-opacity="0.5" stroke="%23fde68a" stroke-width="2.5"/><line x1="30" y1="140" x2="570" y2="140" stroke="%23fcd34d" stroke-width="2" stroke-dasharray="6 6"/><line x1="30" y1="250" x2="570" y2="250" stroke="%23fcd34d" stroke-width="2" stroke-dasharray="6 6"/><circle cx="120" cy="85" r="34" fill="%23fde68a" stroke="%23d97706" stroke-width="1.5"/><text x="90" y="90" fill="%2392400e" font-size="12" font-weight="bold">🥔 馬鈴薯 2顆</text><rect x="220" y="60" width="110" height="50" rx="10" fill="%23fef08a" stroke="%23eab308" stroke-width="1.5"/><text x="245" y="90" fill="%23854d0e" font-size="12" font-weight="bold">🥚 雞蛋 2顆</text><rect x="380" y="60" width="115" height="50" rx="10" fill="%23fef9c3" stroke="%23ca8a04" stroke-width="1.5"/><text x="405" y="90" fill="%23713f12" font-size="12" font-weight="bold">🧀 起司片 2片</text><circle cx="150" cy="195" r="30" fill="%23ffedd5" stroke="%23ea580c" stroke-width="1.5"/><text x="120" y="200" fill="%239a3412" font-size="12" font-weight="bold">🧅 洋蔥 0.5顆</text><circle cx="300" cy="195" r="26" fill="%23ffffff" stroke="%23d6d3d1" stroke-width="1.5"/><text x="275" y="200" fill="%2344403c" font-size="12" font-weight="bold">🧄 大蒜 3瓣</text><text x="60" y="315" fill="%2392400e" font-size="14" font-weight="bold">✨ 月底救急挑戰 · 零剩食美味變身</text></svg>`,
  },
];
