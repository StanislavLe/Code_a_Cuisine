// src/app/services/firestore-recipe.service.ts
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
  where,
  docData,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { StoredRecipe } from '../models/stored-recipe.model';
import { RecipeData } from '../models/recipe-data.model';
import { Observable } from 'rxjs';
import { cuisines } from '../cookbook/cuisine/cuisine-data';

@Injectable({ providedIn: 'root' })
export class FirestoreRecipeService {
  constructor(private firestore: Firestore) {}

  /**
   * ✅ Speichert Like eines Nutzers pro Rezept nur einmal
   */
  async saveLikedRecipe(
    recipe: any,
    inputData: RecipeData,
    clientId: string
  ): Promise<void> {
    const recipesRef = collection(this.firestore, 'recipes');
    const likesRef = collection(this.firestore, 'userLikes');
    const recipeDoc = doc(recipesRef, recipe.recipe_id);
    const likeDoc = doc(likesRef, `${clientId}_${recipe.recipe_id}`);

    // Prüfen, ob User bereits geliked hat
    const likeSnap = await getDoc(likeDoc);
    if (likeSnap.exists()) {
      console.log('⚠️ User hat dieses Rezept bereits geliked.');
      return;
    }

    // Rezept anlegen oder Like-Zähler erhöhen
    const recipeSnap = await getDoc(recipeDoc);
    const rawCuisine = inputData.preferences.cuisines?.[0];
    const cuisineId =
      cuisines.find(
        (c) =>
          c.id.toLowerCase() === rawCuisine?.toLowerCase() ||
          c.label.toLowerCase() === rawCuisine?.toLowerCase()
      )?.id || 'unknown';

    if (recipeSnap.exists()) {
      await updateDoc(recipeDoc, { likes: increment(1) });
    } else {
      const stored: StoredRecipe = {
        recipe_id: recipe.recipe_id,
        recipe_name: recipe.recipe_name,
        total_time_minutes: recipe.total_time_minutes,
        helpers: recipe.helpers,
        dietary_preferences: recipe.dietary_preferences || [],
        cook_time: recipe.cook_time,
        nutrition: recipe.nutrition,
        ingredients: recipe.ingredients,
        instruction_groups: recipe.instruction_groups,
        input_ingredients: inputData.ingredients,
        input_preferences: inputData.preferences,
        cuisineId,
        likes: 1,
        createdAt: new Date(),
        createdByClientId: clientId,
      };
      await setDoc(recipeDoc, stored);
    }

    // User-Like speichern
    await setDoc(likeDoc, {
      clientId,
      recipeId: recipe.recipe_id,
      likedAt: new Date(),
    });

    console.log(`💚 Like gespeichert: ${clientId}_${recipe.recipe_id}`);
  }

  /** Prüfen, ob User ein Rezept geliked hat */
  async hasUserLikedRecipe(clientId: string, recipeId: string): Promise<boolean> {
    const likeDoc = doc(this.firestore, 'userLikes', `${clientId}_${recipeId}`);
    const likeSnap = await getDoc(likeDoc);
    return likeSnap.exists();
  }

  /** Beliebteste Rezepte */
  getTopRecipes(limitNumber: number): Observable<StoredRecipe[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    const q = query(recipesRef, orderBy('likes', 'desc'), limit(limitNumber));
    return collectionData(q, { idField: 'id' }) as Observable<StoredRecipe[]>;
  }

  /** Rezepte nach Küche */
  getRecipesByCuisine(cuisineId: string): Observable<StoredRecipe[]> {
    const recipesRef = collection(this.firestore, 'recipes');
    const q = query(recipesRef, where('cuisineId', '==', cuisineId));
    return collectionData(q, { idField: 'id' }) as Observable<StoredRecipe[]>;
  }

  /** Einzelnes Rezept nach ID */
  getRecipeById(recipeId: string): Observable<StoredRecipe | undefined> {
    const docRef = doc(this.firestore, 'recipes', recipeId);
    return docData(docRef, { idField: 'id' }) as Observable<StoredRecipe | undefined>;
  }
}
