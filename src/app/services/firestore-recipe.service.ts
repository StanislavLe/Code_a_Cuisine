// src/app/services/firestore-recipe.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  limit,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StoredRecipe } from '../models/stored-recipe.model';
import { RecipeData } from '../models/recipe-data.model';

@Injectable({ providedIn: 'root' })
export class FirestoreRecipeService {

  constructor(private firestore: Firestore) {}

  /**
   * Wird beim Like aufgerufen.
   * - Wenn Rezept mit recipe_id schon existiert -> likes++
   * - Sonst: neues Dokument mit likes = 1 anlegen
   */
  async saveLikedRecipe(
    recipe: any,
    recipeData: RecipeData,
    clientId: string
  ): Promise<void> {
    if (!recipe?.recipe_id) {
      throw new Error('Rezept hat keine recipe_id – kann nicht gespeichert werden.');
    }

    const recipeId = recipe.recipe_id as string;
    const ref = doc(this.firestore, 'recipes', recipeId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // 🔁 Rezept gibt es schon -> Like hochzählen
      await updateDoc(ref, {
        likes: increment(1),
      });
      return;
    }

    // 🆕 neues Rezept-Dokument anlegen
    const payload: StoredRecipe = {
      recipe_id: recipe.recipe_id,
      recipe_name: recipe.recipe_name,
      total_time_minutes: recipe.total_time_minutes,
      helpers: recipe.helpers,
      dietary_preferences: recipe.dietary_preferences,
      cook_time: recipe.cook_time,
      nutrition: recipe.nutrition,
      ingredients: recipe.ingredients,
      instruction_groups: recipe.instruction_groups,
      input_ingredients: recipeData.ingredients,
      input_preferences: recipeData.preferences,
      likes: 1,
      createdAt: new Date(),
      createdByClientId: clientId,
    };

    await setDoc(ref, payload);
  }

  /**
   * Top-Rezepte nach Likes sortiert (für das Kochbuch).
   */
  getTopRecipes(limitCount = 10): Observable<StoredRecipe[]> {
    const coll = collection(this.firestore, 'recipes');
    const q = query(coll, orderBy('likes', 'desc'), limit(limitCount));
    return collectionData(q, { idField: 'id' }) as Observable<StoredRecipe[]>;
  }
}
