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
  private fromPage: 'results' | 'recipe-list' = 'results';
  private fromCuisineId?: string;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeDataService,
    private router: Router,
    private firestoreRecipeService: FirestoreRecipeService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📥 Recipe ID from route:', id);
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras.state || {}) as { from?: string; cuisineId?: string };
    if (state.from === 'recipe-list') {
      this.fromPage = 'recipe-list';
    } else {
      this.fromPage = 'results';
    }
    if (state.cuisineId) {
      this.fromCuisineId = state.cuisineId;
    }
    console.log('🧭 Navigation state:', state, '→ fromPage:', this.fromPage, 'cuisineId:', this.fromCuisineId);
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
        } else {
          console.warn('⚠️ No recipe found in Firestore for id:', id);
        }
      });
    }
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
    } else {
      this.router.navigate(['/results']);
    }
  }

  async onLike() {
    if (!this.recipe || this.isLiking) return;
    this.isLiking = true;
    try {
      const clientId = this.getOrCreateClientId();
      const recipeData = this.recipeService.getRecipeData();
      await this.firestoreRecipeService.saveLikedRecipe(
        this.recipe,
        recipeData,
        clientId
      );
      this.hasLiked = true;
      console.log('✅ Rezept im Kochbuch gespeichert / Like erhöht');
    } catch (err) {
      console.error('❌ Fehler beim Speichern des Rezepts in Firestore:', err);
    } finally {
      this.isLiking = false;
    }
  }

  private getOrCreateClientId(): string {
    const KEY = 'clientId';
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
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
    this.router.navigate(['/cookbook']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
