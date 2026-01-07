// src/app/recipe/recipe.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeDataService } from '../services/recipe-data.service';
import { CommonModule } from '@angular/common';
import { FirestoreRecipeService } from '../services/firestore-recipe.service';
import { StoredRecipe } from '../models/stored-recipe.model';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent implements OnInit {
  recipe: any = null;
  isLiking = false;
  hasLiked = false;
  isHovered = false;
  fromPage: 'results' | 'recipe-list' | 'cookbook' = 'results';
  private fromCuisineId?: string;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeDataService,
    private router: Router,
    private firestoreRecipeService: FirestoreRecipeService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const queryFrom = this.route.snapshot.queryParamMap.get('from');
    const queryCuisine = this.route.snapshot.queryParamMap.get('cuisine');

    if (queryFrom === 'recipe-list') {
      this.fromPage = 'recipe-list';
      this.fromCuisineId = queryCuisine || undefined;
    } else if (queryFrom === 'cookbook') {
      this.fromPage = 'cookbook';
    } else {
      this.fromPage = 'results';
    }

    const result = this.recipeService.getResult();
    let allRecipes: any[] = [];
    if (Array.isArray(result)) allRecipes = result;
    else if (result?.recipes && Array.isArray(result.recipes)) allRecipes = result.recipes;
    else if (result) allRecipes = [result];

    if (id) this.recipe = allRecipes.find(r => r.recipe_id === id);

    if (!this.recipe && id) {
      // Rezept aus Firestore nachladen
      this.firestoreRecipeService.getRecipeById(id).subscribe(async (stored: StoredRecipe | undefined) => {
        if (stored) {
          this.recipe = stored;
          await this.updateLikeStatus();
        }
      });
    } else if (this.recipe) {
      await this.updateLikeStatus(); // 🔹 Direkt prüfen ohne Delay
    }
  }

  /** Like-Status prüfen */
  private async updateLikeStatus() {
    const clientHash = await this.getClientHash();
    const cached = localStorage.getItem(`liked_${this.recipe.recipe_id}`);
    if (cached === 'true') {
      this.hasLiked = true; // ⚡ sofortiges Rendering aus Cache
    } else {
      this.hasLiked = await this.firestoreRecipeService.hasUserLikedRecipe(clientHash, this.recipe.recipe_id);
      if (this.hasLiked) localStorage.setItem(`liked_${this.recipe.recipe_id}`, 'true');
    }
  }

  getBackButtonText(): string {
    if (this.fromPage === 'recipe-list') return 'Recipe list';
    if (this.fromPage === 'cookbook') return 'Cookbook';
    return 'Recipe results';
  }

  goBack() {
    if (this.fromPage === 'recipe-list') {
      if (this.fromCuisineId) {
        this.router.navigate(['/recipe-list'], { queryParams: { cuisine: this.fromCuisineId } });
      } else {
        this.router.navigate(['/cookbook']);
      }
    } else if (this.fromPage === 'cookbook') {
      this.router.navigate(['/cookbook']);
    } else {
      this.router.navigate(['/results']);
    }
  }

  /** Hash abrufen und lokal cachen */
  private async getClientHash(): Promise<string> {
    const CACHE_KEY = 'clientHash';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return cached;

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;
      const encoder = new TextEncoder();
      const msgUint8 = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(CACHE_KEY, hashHex);
      return hashHex;
    } catch (err) {
      console.warn('⚠️ IP-Hashing fehlgeschlagen, Fallback auf lokale UUID', err);
      return this.getOrCreateFallbackId();
    }
  }

  private getOrCreateFallbackId(): string {
    const KEY = 'clientId';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  /** Rezept liken (einmalig) */
  async onLike() {
    if (!this.recipe || this.isLiking || this.hasLiked) return;
    this.isLiking = true;

    try {
      const clientHash = await this.getClientHash();
      const recipeData = this.recipeService.getRecipeData();
      await this.firestoreRecipeService.saveLikedRecipe(this.recipe, recipeData, clientHash);
      this.hasLiked = true;
      localStorage.setItem(`liked_${this.recipe.recipe_id}`, 'true'); // sofort speichern
    } catch (err) {
      console.error('❌ Fehler beim Speichern des Rezepts in Firestore:', err);
    } finally {
      this.isLiking = false;
    }
  }

  chefIconPaths: string[] = [
    '../../assets/img/chef1.png',
    '../../assets/img/chef2.png',
    '../../assets/img/chef3.png',
    '../../assets/img/chef4.png',
  ];

  getVisibleChefIcons(): string[] {
    const helpers = Number(this.recipe?.helpers ?? 0);
    const cooksToShow = Math.min(helpers, this.chefIconPaths.length);
    return this.chefIconPaths.slice(0, cooksToShow);
  }

  generateNewRecipe() {
    this.router.navigate(['/step1']);
  }

  goToCookbook() {
    const id = this.recipe?.recipe_id;
    this.router.navigate(['/cookbook'], { queryParams: { from: 'recipe', recipeId: id } });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
