import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
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

  private recipeReady$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  setIngredients(ingredients: RecipeData['ingredients']) {
    this.recipeData.ingredients = ingredients;
    this.saveToStorage();
  }

  getIngredients() {
    return this.recipeData.ingredients;
  }

  setPreferences(preferences: Partial<RecipeData['preferences']>) {
    this.recipeData.preferences = { ...this.recipeData.preferences, ...preferences };
    this.saveToStorage();
  }

  getPreferences() {
    return this.recipeData.preferences;
  }

  setResult(result: any) {
    this.recipeData.result = result;
    this.recipeReady$.next(true);
    this.saveToStorage();
  }

  getResult() {
    return this.recipeData.result;
  }

  isRecipeReady() {
    return this.recipeReady$.asObservable();
  }

  getRecipeData(): RecipeData {
    return this.recipeData;
  }

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

        // 🔥 Wenn beim Laden schon ein Ergebnis vorhanden ist,
        // dann ist das Rezept "fertig" und kann angezeigt werden.
        if (this.recipeData.result) {
          this.recipeReady$.next(true);
        }
      }
    } catch (err) {
      console.error('⚠️ Fehler beim Laden aus localStorage:', err);
    }
  }
}

// in recipe-data.service.ts

clearResult() {
  // nur das Ergebnis löschen
  this.recipeData.result = undefined;
  this.recipeReady$.next(false);
  this.saveToStorage();
}


finalizeRecipe() {
  // Früher: localStorage.removeItem(STORAGE_KEY)
  // Jetzt: NO-OP oder ganz entfernen
  // Wir wollen die Daten im localStorage behalten,
  // bis der User bewusst reset() auslöst.
}

reset() {
  // ggf. clearResult aufrufen, um sicher zu gehen
  this.recipeData = {
    ingredients: [],
    preferences: {
      portions: 1,
      persons: 1,
      cookingTimes: [],
      cuisines: [],
      diets: [],
    },
    result: undefined,
  };

  this.recipeReady$.next(false);

  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

}
