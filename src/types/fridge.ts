export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  category: '蔬菜類' | '肉品海鮮' | '蛋豆製品' | '乳製品/飲料' | '水果類' | '加工/其他' | string;
  notes?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface DeductItem {
  name: string;
  deduct_quantity: number;
  unit: string;
  remaining_quantity: number;
}

export interface RecipeStep {
  step_number: number;
  title: string;
  instruction: string;
  duration_minutes: number;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  cooking_time_minutes: number;
  appliances_used: string[];
  dietary_tags?: string[];
  flavor_profile?: string;
  description: string;
  deduct_list: DeductItem[];
  basic_seasonings: string[];
  steps: RecipeStep[];
  chef_tips?: string;
}

export interface RemainingInventorySummaryItem {
  name: string;
  original_quantity: number;
  total_deducted: number;
  remaining_quantity: number;
  unit: string;
}

export interface FridgeAnalysisResult {
  detected_inventory: InventoryItem[];
  recipes: Recipe[];
  total_remaining_inventory?: RemainingInventorySummaryItem[];
}

export interface UserPreferences {
  appliances: string[];
  diet: string;
  time_limit_minutes: number;
  servings: number;
  special_notes?: string;
}
