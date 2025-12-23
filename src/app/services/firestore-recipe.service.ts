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
   * Speichert ein geliktes Rezept in Firestore.
   * Falls es existiert → Likes erhöhen
   * Falls nicht → Rezept komplett anlegen
   */
 async saveLikedRecipe(
  recipe: any,
  inputData: RecipeData,
  clientId: string
): Promise<void> {
  const recipesRef = collection(this.firestore, 'recipes');
  const docRef = doc(recipesRef, recipe.recipe_id);

  const snap = await getDoc(docRef);

  // Wert aus den Preferences
  const rawCuisine = inputData.preferences.cuisines?.[0];

  // Auf bekannte IDs mappen (z.B. "German" -> "german")
  const cuisineId =
    cuisines.find(c =>
      c.id.toLowerCase() === rawCuisine?.toLowerCase() ||
      c.label.toLowerCase() === rawCuisine?.toLowerCase()
    )?.id || 'unknown';

  console.log('💾 rawCuisine:', rawCuisine, '→ mapped cuisineId:', cuisineId);

  if (snap.exists()) {
    await updateDoc(docRef, {
      likes: increment(1),
    });
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

      cuisineId, // jetzt sauber normalisiert

      likes: 1,
      createdAt: new Date(),
      createdByClientId: clientId,
    };

    await setDoc(docRef, stored);
  }
}


  /**
   * Holt Top-Rezepte nach Likes (z. B. für das Cookbook)
   */
  getTopRecipes(limitNumber: number): Observable<StoredRecipe[]> {
    const recipesRef = collection(this.firestore, 'recipes');

    const q = query(
      recipesRef,
      orderBy('likes', 'desc'),
      limit(limitNumber)
    );

    return collectionData(q, { idField: 'id' }) as Observable<StoredRecipe[]>;
  }

getRecipesByCuisine(cuisineId: string): Observable<StoredRecipe[]> {
  const recipesRef = collection(this.firestore, 'recipes');

  const q = query(
    recipesRef,
    where('cuisineId', '==', cuisineId),
    // orderBy('likes', 'desc') // später wieder rein, wenn alles passt
  );

  return collectionData(q, { idField: 'id' }) as Observable<StoredRecipe[]>;
}

getRecipeById(recipeId: string): Observable<StoredRecipe | undefined> {
  const docRef = doc(this.firestore, 'recipes', recipeId);
  return docData(docRef, { idField: 'id' }) as Observable<StoredRecipe | undefined>;
}


}
