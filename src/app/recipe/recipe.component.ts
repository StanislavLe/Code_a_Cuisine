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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📥 Recipe ID from route:', id);

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

    console.log('🧭 Query params → fromPage:', this.fromPage, 'cuisineId:', this.fromCuisineId);

    const result = this.recipeService.getResult();
    console.log('📦 Full result in RecipeComponent:', result);

    let allRecipes: any[] = [];
    if (Array.isArray(result)) {
      allRecipes = result;
    } else if (result?.recipes && Array.isArray(result.recipes)) {
      allRecipes = result.recipes;
    } else if (result) {
      allRecipes = [result];
    }

    if (id) {
      this.recipe = allRecipes.find(r => r.recipe_id === id);
    }

    console.log('🎯 Selected recipe from RAM:', this.recipe);

    if (!this.recipe && id) {
      this.firestoreRecipeService.getRecipeById(id).subscribe((stored: StoredRecipe | undefined) => {
        if (stored) {
          console.log('🗄️ Loaded recipe from Firestore:', stored);
          this.recipe = stored;

          if (stored.cuisineId && !queryFrom) {
            this.fromPage = 'recipe-list';
            this.fromCuisineId = stored.cuisineId;
            console.log('🔄 Fallback: Using stored cuisineId:', this.fromCuisineId);
          }
        } else {
          console.warn('⚠️ No recipe found in Firestore for id:', id);
        }
      });
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
        this.router.navigate(['/recipe-list'], {
          queryParams: { cuisine: this.fromCuisineId },
        });
      } else {
        this.router.navigate(['/cookbook']);
      }
    } else if (this.fromPage === 'cookbook') {
      this.router.navigate(['/cookbook']);
    } else {
      this.router.navigate(['/results']);
    }
  }

  /**
   * Öffentliche IP-Adresse hashen (DSGVO-konform)
   */
  private async getClientHash(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;
      const encoder = new TextEncoder();
      const msgUint8 = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log('🌐 Client Hash erkannt:', hashHex);
      return hashHex;
    } catch (err) {
      console.warn('⚠️ IP-Hashing fehlgeschlagen, Fallback auf lokale UUID', err);
      return this.getOrCreateFallbackId();
    }
  }

  /**
   * Fallback-ID (lokale UUID), falls IP nicht verfügbar ist
   */
  private getOrCreateFallbackId(): string {
    const KEY = 'clientId';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  }

  /**
   * Rezept liken / speichern
   */
  async onLike() {
    if (!this.recipe || this.isLiking) return;
    this.isLiking = true;

    try {
      const clientHash = await this.getClientHash(); // 👈 gehashte IP statt Klartext
      const recipeData = this.recipeService.getRecipeData();

      await this.firestoreRecipeService.saveLikedRecipe(
        this.recipe,
        recipeData,
        clientHash
      );

      this.hasLiked = true;
      console.log(`💚 Rezept geliked von Client Hash: ${clientHash}`);
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

  getChefImage(role: string): string {
    const key = role.toLowerCase();
    if (key.includes('helfer 1')) return '../../assets/img/chef1.png';
    if (key.includes('helfer 2')) return '../../assets/img/chef2.png';
    if (key.includes('helfer 3')) return '../../assets/img/chef3.png';
    if (key.includes('helfer 4')) return '../../assets/img/chef4.png';
    return '../../assets/img/default_chef.png';
  }

  get groupedInstructions() {
    const groups: { [key: string]: any[] } = {};
    this.recipe.instructions.forEach((inst: any) => {
      if (!groups[inst.assigned_to]) groups[inst.assigned_to] = [];
      groups[inst.assigned_to].push(inst);
    });
    return groups;
  }

  generateNewRecipe() {
    this.router.navigate(['/step1']);
  }

  goToCookbook() {
    const currentFrom = this.route.snapshot.queryParamMap.get('from');
    const id = this.recipe?.recipe_id;
    if (currentFrom === 'results') {
      this.router.navigate(['/cookbook'], {
        queryParams: { from: 'results', recipeId: id },
      });
    } else {
      this.router.navigate(['/cookbook'], {
        queryParams: { from: 'recipe', recipeId: id },
      });
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
