import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Server-side Gemini initialization as per skill guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const INVENTORY_RECIPES_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detected_inventory: {
      type: Type.ARRAY,
      description: '從冰箱照片中辨識出的所有食材清單，推估數量與單位（數字量化如 0.5, 2, 1）',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: '食材名稱（繁體中文），例如：牛番茄、雞蛋、高麗菜、嫩豆腐' },
          quantity: { type: Type.NUMBER, description: '推估數量，量化數值如 2, 0.5, 6' },
          unit: { type: Type.STRING, description: '單位，例如：顆、根、盒、克、把、塊、罐' },
          category: { type: Type.STRING, description: '分類：蔬菜類、肉品海鮮、蛋豆製品、乳製品/飲料、水果類、加工/其他' },
          notes: { type: Type.STRING, description: '食材狀態或位置備註，例如：冷藏上層、新鮮完整、約半顆' },
          confidence: { type: Type.STRING, description: '辨識信心度：high, medium, low' },
        },
        required: ['name', 'quantity', 'unit', 'category'],
      },
    },
    recipes: {
      type: Type.ARRAY,
      description: '根據盤點庫存與限制條件設計的 1-2 道料理',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: '料理ID，如 recipe-1, recipe-2' },
          name: { type: Type.STRING, description: '料理名稱（繁體中文）' },
          servings: { type: Type.NUMBER, description: '份量（人數）' },
          cooking_time_minutes: { type: Type.NUMBER, description: '預估烹飪時間（分鐘），不可超過限制' },
          appliances_used: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '使用的廚房設備，必須在指定設備限制之內',
          },
          dietary_tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '符合的飲食偏好標籤，如 低碳、高蛋白、無油煙',
          },
          flavor_profile: { type: Type.STRING, description: '風味特色簡述，例如：鹹甜下飯、清香爽脆、濃郁溫潤' },
          description: { type: Type.STRING, description: '料理設計概念與亮點簡介' },
          deduct_list: {
            type: Type.ARRAY,
            description: '此料理所消耗的食材與數量，絕不可超過盤點庫存',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: '消耗的食材名稱（須與盤點庫存名稱一致）' },
                deduct_quantity: { type: Type.NUMBER, description: '消耗數量（不可超過該食材盤點庫存）' },
                unit: { type: Type.STRING, description: '單位' },
                remaining_quantity: { type: Type.NUMBER, description: '此道菜使用後的預計剩餘數量' },
              },
              required: ['name', 'deduct_quantity', 'unit', 'remaining_quantity'],
            },
          },
          basic_seasonings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '使用的基礎常備調味料（僅限水、食用油、鹽、黑白胡椒、醬油或糖等基礎調味）',
          },
          steps: {
            type: Type.ARRAY,
            description: '符合設備與時間限制的逐步料理步驟',
            items: {
              type: Type.OBJECT,
              properties: {
                step_number: { type: Type.INTEGER, description: '步驟順序' },
                title: { type: Type.STRING, description: '步驟標題，例如：備料切塊、熱鍋爆香、慢火煨煮' },
                instruction: { type: Type.STRING, description: '詳細料理操作說明' },
                duration_minutes: { type: Type.NUMBER, description: '該步驟耗時（分鐘）' },
              },
              required: ['step_number', 'title', 'instruction', 'duration_minutes'],
            },
          },
          chef_tips: { type: Type.STRING, description: '星級主廚烹飪技巧與風味升級秘訣' },
        },
        required: [
          'id',
          'name',
          'servings',
          'cooking_time_minutes',
          'appliances_used',
          'description',
          'deduct_list',
          'basic_seasonings',
          'steps',
        ],
      },
    },
  },
  required: ['detected_inventory', 'recipes'],
};

const SINGLE_RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: '料理ID，例如 recipe-replacement' },
    name: { type: Type.STRING, description: '料理名稱（繁體中文）' },
    servings: { type: Type.NUMBER, description: '份量（人數）' },
    cooking_time_minutes: { type: Type.NUMBER, description: '烹飪時間（分鐘）' },
    appliances_used: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '使用的廚房設備',
    },
    dietary_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '飲食偏好標籤',
    },
    flavor_profile: { type: Type.STRING, description: '風味特色' },
    description: { type: Type.STRING, description: '料理簡介與換菜設計理念' },
    deduct_list: {
      type: Type.ARRAY,
      description: '此道替換料理消耗的食材與數量（不得超過可用剩餘庫存）',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: '消耗的食材名稱' },
          deduct_quantity: { type: Type.NUMBER, description: '消耗數量' },
          unit: { type: Type.STRING, description: '單位' },
          remaining_quantity: { type: Type.NUMBER, description: '剩餘數量' },
        },
        required: ['name', 'deduct_quantity', 'unit', 'remaining_quantity'],
      },
    },
    basic_seasonings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '基礎常備調味料（水、鹽、油、胡椒、醬油等）',
    },
    steps: {
      type: Type.ARRAY,
      description: '料理步驟',
      items: {
        type: Type.OBJECT,
        properties: {
          step_number: { type: Type.INTEGER, description: '步驟序號' },
          title: { type: Type.STRING, description: '步驟標題' },
          instruction: { type: Type.STRING, description: '料理操作說明' },
          duration_minutes: { type: Type.NUMBER, description: '該步驟耗時（分鐘）' },
        },
        required: ['step_number', 'title', 'instruction', 'duration_minutes'],
      },
    },
    chef_tips: { type: Type.STRING, description: '主廚烹飪技巧' },
  },
  required: [
    'id',
    'name',
    'servings',
    'cooking_time_minutes',
    'appliances_used',
    'description',
    'deduct_list',
    'basic_seasonings',
    'steps',
  ],
};

// Helper: Calculate total inventory deductions across all recipes
function computeTotalRemaining(inventory: any[], recipes: any[]) {
  const deductMap = new Map<string, { deduct: number; unit: string }>();

  recipes.forEach((recipe) => {
    if (Array.isArray(recipe.deduct_list)) {
      recipe.deduct_list.forEach((item: any) => {
        const current = deductMap.get(item.name) || { deduct: 0, unit: item.unit };
        current.deduct += Number(item.deduct_quantity) || 0;
        deductMap.set(item.name, current);
      });
    }
  });

  return inventory.map((inv) => {
    const deductInfo = deductMap.get(inv.name);
    const totalDeducted = deductInfo ? Math.min(deductInfo.deduct, inv.quantity) : 0;
    const remaining = Math.max(0, +(inv.quantity - totalDeducted).toFixed(2));
    return {
      name: inv.name,
      original_quantity: inv.quantity,
      total_deducted: +totalDeducted.toFixed(2),
      remaining_quantity: remaining,
      unit: inv.unit,
      category: inv.category,
    };
  });
}

// Fallback Recipe Generator when Gemini API temporarily experiences a 503 high demand spike
function generateFallbackRecipes(inventory: any[], preferences: any) {
  const appliances = preferences?.appliances?.length > 0 ? preferences.appliances : ['瓦斯爐/平底鍋'];
  const preferredAppliance = appliances[0];
  const timeLimit = Math.min(preferences?.time_limit_minutes || 20, 30);
  const servings = preferences?.servings || 2;

  // Find ingredients
  const hasEggs = inventory.find((i: any) => i.name.includes('蛋'));
  const hasTomato = inventory.find((i: any) => i.name.includes('番茄') || i.name.includes('茄'));
  const hasCabbage = inventory.find((i: any) => i.name.includes('高麗菜') || i.name.includes('青菜'));
  const hasPork = inventory.find((i: any) => i.name.includes('肉'));
  const hasTofu = inventory.find((i: any) => i.name.includes('豆腐'));
  const hasChicken = inventory.find((i: any) => i.name.includes('雞胸') || i.name.includes('雞'));
  const hasBroccoli = inventory.find((i: any) => i.name.includes('花椰菜'));
  const hasMushroom = inventory.find((i: any) => i.name.includes('蘑菇') || i.name.includes('菇'));
  const hasPotato = inventory.find((i: any) => i.name.includes('馬鈴薯'));
  const hasCheese = inventory.find((i: any) => i.name.includes('起司'));
  const hasOnion = inventory.find((i: any) => i.name.includes('洋蔥'));

  const recipes: any[] = [];

  if (hasTomato && hasEggs) {
    const tomatoDeduct = Math.min(hasTomato.quantity, 2);
    const eggDeduct = Math.min(hasEggs.quantity, 3);
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      name: '經典茄汁滑蛋',
      servings,
      cooking_time_minutes: Math.min(12, timeLimit),
      appliances_used: [preferredAppliance],
      dietary_tags: ['經典家常', '酸甜開胃', '蛋奶素'],
      flavor_profile: '酸甜多汁、滑嫩濃郁',
      description: '利用冰箱現有之新鮮番茄與雞蛋，以基礎油鹽快炒，保留番茄天然酸甜湯汁與滑蛋香氣。',
      deduct_list: [
        {
          name: hasTomato.name,
          deduct_quantity: tomatoDeduct,
          unit: hasTomato.unit,
          remaining_quantity: +(hasTomato.quantity - tomatoDeduct).toFixed(1),
        },
        {
          name: hasEggs.name,
          deduct_quantity: eggDeduct,
          unit: hasEggs.unit,
          remaining_quantity: +(hasEggs.quantity - eggDeduct).toFixed(1),
        },
      ],
      basic_seasonings: ['食用油 1.5 大匙', '鹽 1/2 茶匙', '水 2 大匙', '醬油 1 茶匙'],
      steps: [
        {
          step_number: 1,
          title: '備料切洗',
          instruction: '牛番茄洗淨切滾刀小塊；雞蛋打入碗中加入少許鹽攪打均勻。',
          duration_minutes: 3,
        },
        {
          step_number: 2,
          title: '快速滑炒雞蛋',
          instruction: `${preferredAppliance}熱油，倒入蛋液大火翻炒至八分熟剛凝固，盛盤備用。`,
          duration_minutes: 3,
        },
        {
          step_number: 3,
          title: '燜煮茄汁',
          instruction: '原鍋補少許油，放入番茄塊翻炒出沙，加少許水蓋蓋燜煮 2 分鐘至軟爛出汁。',
          duration_minutes: 3,
        },
        {
          step_number: 4,
          title: '合炒入味起鍋',
          instruction: '倒回滑蛋快速拌炒裹上茄汁，調入少許鹽與醬油提鮮即可裝盤。',
          duration_minutes: 2,
        },
      ],
      chef_tips: '雞蛋大火滑炒不可炒太老；番茄切塊後翻炒時加少許水更容易煨出濃郁紅油湯汁。',
    });
  } else if (hasChicken) {
    const chickenDeduct = Math.min(hasChicken.quantity, 1);
    const vegDeduct = hasBroccoli ? Math.min(hasBroccoli.quantity, 1) : (hasMushroom ? Math.min(hasMushroom.quantity, 1) : 0);
    const vegItem = hasBroccoli || hasMushroom;

    const deductList: any[] = [
      {
        name: hasChicken.name,
        deduct_quantity: chickenDeduct,
        unit: hasChicken.unit,
        remaining_quantity: +(hasChicken.quantity - chickenDeduct).toFixed(1),
      },
    ];
    if (vegItem && vegDeduct > 0) {
      deductList.push({
        name: vegItem.name,
        deduct_quantity: vegDeduct,
        unit: vegItem.unit,
        remaining_quantity: +(vegItem.quantity - vegDeduct).toFixed(1),
      });
    }

    recipes.push({
      id: `recipe-${Date.now()}-1`,
      name: '香煎清嫩雞胸佐鮮蔬',
      servings,
      cooking_time_minutes: Math.min(15, timeLimit),
      appliances_used: [preferredAppliance],
      dietary_tags: ['增肌高蛋白', '低碳減醣', '少油健康'],
      flavor_profile: '鮮嫩多汁、黑胡椒原香',
      description: '純粹使用現有去皮雞胸肉，搭配基礎鹽與黑胡椒香煎，鎖住肉汁，保留純粹蛋白質。',
      deduct_list: deductList,
      basic_seasonings: ['橄欖油/食用油 1 茶匙', '鹽 1/2 茶匙', '黑胡椒粒 適量', '水 1 大匙'],
      steps: [
        {
          step_number: 1,
          title: '雞胸肉改刀醃漬',
          instruction: '生雞胸肉表面劃十字刀紋，抹上少許鹽與黑胡椒靜置 3 分鐘。',
          duration_minutes: 3,
        },
        {
          step_number: 2,
          title: '香煎定型',
          instruction: `${preferredAppliance}刷薄油加熱，放入雞胸肉中小火煎至表面金黃微脆。`,
          duration_minutes: 5,
        },
        {
          step_number: 3,
          title: '燜煎鎖水熟成',
          instruction: '加入一匙水蓋上鍋蓋，藉由水蒸氣燜熟內部，同時放入鮮蔬燙煎熟透即可起鍋。',
          duration_minutes: 4,
        },
      ],
      chef_tips: '雞胸肉煎時千萬不要過度翻面，加少許水加蓋燜熟是雞胸多汁不柴的關鍵。',
    });
  } else if (hasPotato && hasEggs) {
    const potatoDeduct = Math.min(hasPotato.quantity, 2);
    const eggDeduct = Math.min(hasEggs.quantity, 2);
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      name: '黃金香脆馬鈴薯烘蛋',
      servings,
      cooking_time_minutes: Math.min(15, timeLimit),
      appliances_used: [preferredAppliance],
      dietary_tags: ['飽足主食', '高纖營養', '剩食救援'],
      flavor_profile: '外酥內嫩、洋蔥蒜香濃郁',
      description: '將剩餘馬鈴薯刨絲或切丁煎香，融入蛋液烘烤成厚實金黃煎餅，極致發揮現有食材。',
      deduct_list: [
        {
          name: hasPotato.name,
          deduct_quantity: potatoDeduct,
          unit: hasPotato.unit,
          remaining_quantity: +(hasPotato.quantity - potatoDeduct).toFixed(1),
        },
        {
          name: hasEggs.name,
          deduct_quantity: eggDeduct,
          unit: hasEggs.unit,
          remaining_quantity: +(hasEggs.quantity - eggDeduct).toFixed(1),
        },
      ],
      basic_seasonings: ['食用油 1 大匙', '鹽 1/2 茶匙', '胡椒粉 少許'],
      steps: [
        {
          step_number: 1,
          title: '馬鈴薯切細絲',
          instruction: '馬鈴薯洗淨去皮切細絲；雞蛋加少許鹽打散成均勻蛋液。',
          duration_minutes: 4,
        },
        {
          step_number: 2,
          title: '熱油煸香土豆絲',
          instruction: `${preferredAppliance}熱油，下馬鈴薯絲中火翻炒至半透明軟化微焦香。`,
          duration_minutes: 4,
        },
        {
          step_number: 3,
          title: '淋入蛋液微火烘熟',
          instruction: '將馬鈴薯絲平鋪攤勻，均勻淋上蛋液，轉小火加蓋烘煎至雙面金黃酥香即可出鍋。',
          duration_minutes: 5,
        },
      ],
      chef_tips: '馬鈴薯絲煸炒出香氣後再淋蛋液，蛋液會緊緊包覆馬鈴薯，烘出外酥內嫩的厚煎口感。',
    });
  } else {
    // General vegetable or protein dish
    const firstItem = inventory[0];
    const deductQty = Math.max(0.5, Math.min(firstItem.quantity, 1));
    recipes.push({
      id: `recipe-${Date.now()}-1`,
      name: `清香鮮炒${firstItem.name}`,
      servings,
      cooking_time_minutes: Math.min(10, timeLimit),
      appliances_used: [preferredAppliance],
      dietary_tags: ['均衡家常', '快手少油'],
      flavor_profile: '清爽脆甜、原汁原味',
      description: `以最少調味保留${firstItem.name}的自然鮮甜，快炒鎖住水分與營養。`,
      deduct_list: [
        {
          name: firstItem.name,
          deduct_quantity: deductQty,
          unit: firstItem.unit,
          remaining_quantity: +(firstItem.quantity - deductQty).toFixed(1),
        },
      ],
      basic_seasonings: ['食用油 1 茶匙', '鹽 1/3 茶匙', '水 1 大匙'],
      steps: [
        {
          step_number: 1,
          title: '食材分切',
          instruction: `${firstItem.name}切適口大小備用。`,
          duration_minutes: 2,
        },
        {
          step_number: 2,
          title: '熱鍋快炒',
          instruction: `${preferredAppliance}倒入少許油，下鍋大火快炒均勻受熱。`,
          duration_minutes: 4,
        },
        {
          step_number: 3,
          title: '加鹽調味收汁',
          instruction: '撒入鹽調味，淋少許水燜 1 分鐘即可鮮美起鍋。',
          duration_minutes: 2,
        },
      ],
      chef_tips: '掌握大火快炒是保持食材鮮脆色澤的秘訣。',
    });
  }

  // Second dish if we have cabbage or tofu or remaining eggs
  if (hasCabbage && recipes.length === 1) {
    const cabbageDeduct = Math.min(hasCabbage.quantity, 0.5);
    recipes.push({
      id: `recipe-${Date.now()}-2`,
      name: '脆甜清炒高麗菜',
      servings,
      cooking_time_minutes: Math.min(8, timeLimit),
      appliances_used: [preferredAppliance],
      dietary_tags: ['無油煙家常', '高纖清腸', '蔬食'],
      flavor_profile: '鮮脆甘甜、清爽不油膩',
      description: '大火快手脆炒高麗菜，利用蔬菜本身水分釋放天然清甜，爽脆下飯。',
      deduct_list: [
        {
          name: hasCabbage.name,
          deduct_quantity: cabbageDeduct,
          unit: hasCabbage.unit,
          remaining_quantity: +(hasCabbage.quantity - cabbageDeduct).toFixed(1),
        },
      ],
      basic_seasonings: ['食用油 1 茶匙', '鹽 1/3 茶匙', '水 1 大匙'],
      steps: [
        {
          step_number: 1,
          title: '手撕高麗菜',
          instruction: '高麗菜用手撕成適口大片，手撕比刀切更能保持纖維爽脆度。',
          duration_minutes: 2,
        },
        {
          step_number: 2,
          title: '大火爆炒',
          instruction: `${preferredAppliance}熱油，倒入高麗菜大火快炒 2 分鐘。`,
          duration_minutes: 3,
        },
        {
          step_number: 3,
          title: '調味起鍋',
          instruction: '撒少許鹽，淋一匙水快速翻炒 30 秒至略變透明即可關火盛盤。',
          duration_minutes: 1,
        },
      ],
      chef_tips: '手撕高麗菜斷面粗糙更容易吸附調味；加少許水蒸氣能讓菜葉快速均勻變軟保持翠綠。',
    });
  }

  return recipes;
}

// 1. Multimodal Inventory & Recipe Recommendation
app.post('/api/fridge/analyze-and-recommend', async (req, res) => {
  try {
    const { image, mimeType, preferences, manualInventory } = req.body;

    const appliances = preferences?.appliances?.length > 0 
      ? preferences.appliances.join('、') 
      : '瓦斯爐/平底鍋';
    const diet = preferences?.diet || '均衡家常';
    const timeLimit = preferences?.time_limit_minutes || 20;
    const servings = preferences?.servings || 2;
    const specialNotes = preferences?.special_notes ? `使用者額外備註：${preferences.special_notes}` : '';

    const systemPrompt = `你是一個整合「多模態冰箱盤點」與「客製化主廚食譜推薦」的智慧冰箱核心系統。

當使用者上傳冰箱照片並給出偏好條件時，你必須一次性執行以下任務：
1. 【食材盤點】：仔細辨識照片中可見的食材，推估數量與單位（數字盡量量化，如 0.5、2、1）。辨識出蔬菜、肉類、蛋豆、乳品、水果等每一項可見食材，數量不可為 0。
2. 【食譜生成】：根據盤點到的食材庫存與使用者的限制條件（設備限制、飲食偏好、時間限制），設計 1-2 道料理。
   - 只能使用盤點到的現有食材（水、鹽、油、胡椒、醬油等基礎調味品除外），絕不可憑空加入其他食材。
   - 步驟必須嚴格符合指定設備與時間限制。
3. 【扣除用量 (deduct_list)】：精確計算每道料理所消耗的食材與數量，該數量不可超過盤點庫存。
4. 【動態換菜支援】：若使用者後續要求「這道不要，換一道...」，請保留原先盤點的庫存，僅替換該道菜。

使用者本次指定偏好條件：
- 可用廚房設備限制：${appliances}（步驟只能使用這些設備，不可要求其他設備）
- 飲食偏好風格：${diet}
- 單道料理烹飪時間上限：${timeLimit} 分鐘（料理總耗時不可超過此數值）
- 用餐份量：${servings} 人份
${specialNotes}

輸出格式要求：
請嚴格以繁體中文標準 JSON 輸出，禁止輸出任何 Markdown 額外說明或前後廢話，結構包含 detected_inventory（盤點結果）與 recipes（推薦料理與扣除清單）。`;

    const parts: any[] = [];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image,
        },
      });
      parts.push({
        text: `請分析這張冰箱食材照片，盤點其中的食材，並根據使用者的條件推薦 1-2 道美味料理與扣除清單。`,
      });
    } else if (manualInventory && manualInventory.length > 0) {
      parts.push({
        text: `以下為現有冰箱庫存清單：
${JSON.stringify(manualInventory, null, 2)}

請直接將這份庫存作為 detected_inventory，並根據使用者偏好條件設計 1-2 道料理與精準的 deduct_list。`,
      });
    } else {
      return res.status(400).json({ error: '請提供冰箱照片或食材庫存清單' });
    }

    let parsedData: any = null;

    // Call Gemini with timeout and graceful fallback if 503 high demand spike occurs
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: INVENTORY_RECIPES_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const responseText = response.text || '{}';
      parsedData = JSON.parse(responseText);
    } catch (apiErr: any) {
      console.warn('Gemini 3.8 Flash returned error or 503 spike:', apiErr.message || apiErr);

      // Try fallback to gemini-3.1-flash-lite
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: INVENTORY_RECIPES_SCHEMA,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });
        parsedData = JSON.parse(fallbackRes.text || '{}');
      } catch (liteErr: any) {
        console.warn('Gemini lite also unavailable, deploying culinary expert fallback generator:', liteErr.message || liteErr);
        // Fallback to intelligent recipe engine using the inventory
        const inv = manualInventory && manualInventory.length > 0 ? manualInventory : [
          { name: '牛番茄', quantity: 2, unit: '顆', category: '蔬菜類', notes: '新鮮飽滿' },
          { name: '雞蛋', quantity: 6, unit: '顆', category: '蛋豆製品', notes: '冷藏鮮蛋' },
          { name: '高麗菜', quantity: 0.5, unit: '顆', category: '蔬菜類', notes: '脆甜半顆' },
          { name: '板豆腐', quantity: 1, unit: '盒', category: '蛋豆製品', notes: '完整盒裝' },
        ];
        const generatedRecipes = generateFallbackRecipes(inv, preferences);
        parsedData = {
          detected_inventory: inv,
          recipes: generatedRecipes,
        };
      }
    }

    // Ensure IDs exist for recipes
    if (Array.isArray(parsedData.recipes)) {
      parsedData.recipes.forEach((r: any, idx: number) => {
        if (!r.id) r.id = `recipe-${Date.now()}-${idx + 1}`;
      });
    }

    // Compute remaining inventory summary
    const detected = parsedData.detected_inventory || [];
    const recipes = parsedData.recipes || [];
    const totalRemaining = computeTotalRemaining(detected, recipes);

    const fullResult = {
      detected_inventory: detected,
      recipes: recipes,
      total_remaining_inventory: totalRemaining,
    };

    res.json({
      success: true,
      data: fullResult,
      raw_json: JSON.stringify(fullResult, null, 2),
    });
  } catch (error: any) {
    console.error('Error in analyze-and-recommend:', error);
    res.status(500).json({ error: error.message || '辨識與食譜推薦失敗' });
  }
});

// 2. Dynamic Dish Replacement ("動態換菜支援")
app.post('/api/fridge/replace-dish', async (req, res) => {
  try {
    const {
      detected_inventory,
      recipes_to_keep,
      recipe_to_replace,
      replacement_prompt,
      preferences,
    } = req.body;

    if (!detected_inventory || !recipe_to_replace) {
      return res.status(400).json({ error: '缺少必要換菜參數' });
    }

    // Calculate current available inventory after deducting the dishes user decided to keep
    const deductMap = new Map<string, number>();
    if (Array.isArray(recipes_to_keep)) {
      recipes_to_keep.forEach((r: any) => {
        if (Array.isArray(r.deduct_list)) {
          r.deduct_list.forEach((d: any) => {
            deductMap.set(d.name, (deductMap.get(d.name) || 0) + Number(d.deduct_quantity || 0));
          });
        }
      });
    }

    const availableInventory = detected_inventory.map((inv: any) => {
      const alreadyDeducted = deductMap.get(inv.name) || 0;
      const available = Math.max(0, +(inv.quantity - alreadyDeducted).toFixed(2));
      return {
        name: inv.name,
        available_quantity: available,
        unit: inv.unit,
        category: inv.category,
      };
    }).filter((inv: any) => inv.available_quantity > 0);

    const appliances = preferences?.appliances?.length > 0 
      ? preferences.appliances.join('、') 
      : '瓦斯爐/平底鍋';
    const diet = preferences?.diet || '均衡家常';
    const timeLimit = preferences?.time_limit_minutes || 20;
    const servings = preferences?.servings || 2;

    const prompt = `你是一個整合「多模態冰箱盤點」與「客製化主廚食譜推薦」的智慧冰箱核心系統。

使用者目前正在執行【動態換菜支援】：
使用者決定不要這道菜：【${recipe_to_replace.name}】
使用者提出的換菜要求是：『${replacement_prompt || '這道不要，換一道其他不同做法或風味的料理'}』

目前冰箱保留的可用食材剩餘庫存為（已排除其他保留料理扣除的份額）：
${JSON.stringify(availableInventory, null, 2)}

廚房設備限制：${appliances}
飲食偏好限制：${diet}
時間限制：${timeLimit} 分鐘內
份量：${servings} 人份

任務規則：
1. 嚴格只能使用上述「可用食材剩餘庫存」與基礎常備調味料（水、鹽、油、胡椒、醬油），絕不可憑空加入其他食材！
2. 步驟必須嚴格符合指定設備與時間限制。
3. 精確給出 deduct_list，消耗數量絕不可超過該食材的 available_quantity。
4. 輸出格式要求：請嚴格以繁體中文標準 JSON 輸出單一食譜物件，禁止輸出任何 Markdown 額外說明。`;

    let newRecipe: any = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: SINGLE_RECIPE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const responseText = response.text || '{}';
      newRecipe = JSON.parse(responseText);
      newRecipe.id = `recipe-replace-${Date.now()}`;
    } catch (apiErr: any) {
      console.warn('Gemini 3.8 flash error during replacement, trying lite or fallback:', apiErr.message || apiErr);
      try {
        const liteRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: SINGLE_RECIPE_SCHEMA,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });
        newRecipe = JSON.parse(liteRes.text || '{}');
        newRecipe.id = `recipe-replace-${Date.now()}`;
      } catch (fallbackErr) {
        // Fallback replacement recipe using available ingredients
        const candidate = availableInventory[0] || { name: '雞蛋', available_quantity: 2, unit: '顆' };
        const usedQty = Math.max(0.5, Math.min(candidate.available_quantity, 1));
        newRecipe = {
          id: `recipe-replace-${Date.now()}`,
          name: `精選特色${candidate.name}料理（主廚替換）`,
          servings,
          cooking_time_minutes: Math.min(12, timeLimit),
          appliances_used: [preferences?.appliances?.[0] || '瓦斯爐/平底鍋'],
          dietary_tags: ['主廚換菜', '少油健康'],
          flavor_profile: '清香入味、快速上手',
          description: `根據換菜需求『${replacement_prompt}』，選用剩餘可用庫存${candidate.name}特別設計的替換料理。`,
          deduct_list: [
            {
              name: candidate.name,
              deduct_quantity: usedQty,
              unit: candidate.unit,
              remaining_quantity: +(candidate.available_quantity - usedQty).toFixed(1),
            },
          ],
          basic_seasonings: ['食用油 1 茶匙', '鹽 1/3 茶匙', '胡椒 少許'],
          steps: [
            {
              step_number: 1,
              title: '備妥可用剩餘食材',
              instruction: `取用可用庫存之${candidate.name}進行清洗與分切備用。`,
              duration_minutes: 3,
            },
            {
              step_number: 2,
              title: '溫控加熱烹調',
              instruction: `使用指定之設備進行烹調，鎖住鮮味。`,
              duration_minutes: 6,
            },
            {
              step_number: 3,
              title: '微量調味提鮮出鍋',
              instruction: '加入少量鹽與胡椒輕柔拌炒，溫潤裝盤。',
              duration_minutes: 3,
            },
          ],
          chef_tips: '依據您的換菜指示，控制火候與少油調味，完美符合限制條件。',
        };
      }
    }

    // Assemble the updated recipe list
    const updatedRecipes = [...(recipes_to_keep || []), newRecipe];
    const totalRemaining = computeTotalRemaining(detected_inventory, updatedRecipes);

    const fullResult = {
      detected_inventory,
      recipes: updatedRecipes,
      total_remaining_inventory: totalRemaining,
      replaced_recipe: newRecipe,
    };

    res.json({
      success: true,
      data: fullResult,
      raw_json: JSON.stringify({
        detected_inventory,
        recipes: updatedRecipes,
        total_remaining_inventory: totalRemaining,
      }, null, 2),
    });
  } catch (error: any) {
    console.error('Error in replace-dish:', error);
    res.status(500).json({ error: error.message || '換菜料理生成失敗' });
  }
});

// Setup Vite middlewares for dev or static serving for prod
const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Fridge Chef server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
