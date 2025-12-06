import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RecipeData } from '../models/recipe-data.model';

const STORAGE_KEY = 'recipeData';

@Injectable({ providedIn: 'root' })
export class RecipeDataService {
  private recipeData: RecipeData = {
    ingredients: [],
    preferences: {
      portions: 1,
      persons: 1,
      cookingTimes: [],
      cuisines: [],
      diets: [],
    },
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  // --- Step1 ---
  setIngredients(ingredients: RecipeData['ingredients']) {
    this.recipeData.ingredients = ingredients;
    this.saveToStorage();
  }

  getIngredients() {
    return this.recipeData.ingredients;
  }

  // --- Step2 ---
  setPreferences(preferences: Partial<RecipeData['preferences']>) {
    this.recipeData.preferences = { ...this.recipeData.preferences, ...preferences };
    this.saveToStorage();
  }

  getPreferences() {
    return this.recipeData.preferences;
  }

  // --- JSON Output ---
  getRecipeData(): RecipeData {
    return this.recipeData;
  }

  // --- Save / Load with Browser Check ---
  private saveToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.recipeData));
      } catch (err) {
        console.error('❌ Fehler beim Speichern in localStorage:', err);
      }
    }
  }

  private loadFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.recipeData = JSON.parse(stored);
        }
      } catch (err) {
        console.error('⚠️ Fehler beim Laden aus localStorage:', err);
      }
    }
  }

  reset() {
    this.recipeData = {
      ingredients: [],
      preferences: {
        portions: 1,
        persons: 1,
        cookingTimes: [],
        cuisines: [],
        diets: [],
      },
    };
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
