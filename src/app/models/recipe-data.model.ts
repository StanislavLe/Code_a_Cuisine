export interface RecipeData {
  ingredients: { name: string; quantity: number | null; unit: string }[];
  preferences: {
    portions: number;
    persons: number;
    cookingTimes: string[];
    cuisines: string[];
    diets: string[];
  };
  result?: any;
}
