import { RecipeData } from './recipe-data.model';

export interface StoredRecipe {
  id?: string; 

  recipe_id: string;
  recipe_name: string;
  total_time_minutes: number;
  helpers: number;
  dietary_preferences: string[];
  cook_time: string;

  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };

  ingredients: {
    available: { quantity: number; unit: string; name: string }[];
    added: { quantity: number; unit: string; name: string }[];
  };

  instruction_groups: {
    group_icon: string;
    group_title: string;
    description: string;
    instructions: { text: string }[];
  }[];

  input_ingredients: RecipeData['ingredients'];
  input_preferences: RecipeData['preferences'];
  cuisineId?: string;
  likes: number;
  createdAt: any;
  createdByClientId: string;
}
