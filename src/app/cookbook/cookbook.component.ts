import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreRecipeService } from '../services/firestore-recipe.service';
import { StoredRecipe } from '../models/stored-recipe.model';
import { Observable } from 'rxjs';
import { CuisineComponent } from './cuisine/cuisine.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cookbook',
  standalone: true,
  imports: [CommonModule, CuisineComponent],
  templateUrl: './cookbook.component.html',
  styleUrls: ['./cookbook.component.scss'],
})
export class CookbookComponent implements OnInit {
  topRecipes$!: Observable<StoredRecipe[]>;

  // Informationen zur Herkunft
  fromPage: 'home' | 'recipe' | 'results' = 'home';
  recipeIdFrom?: string;

  constructor(
    private firestoreRecipeService: FirestoreRecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.topRecipes$ = this.firestoreRecipeService.getTopRecipes(3);

    // 🔍 Herkunft prüfen
    const queryFrom = this.route.snapshot.queryParamMap.get('from');
    const recipeId = this.route.snapshot.queryParamMap.get('recipeId');

    if (queryFrom === 'results' && recipeId) {
      this.fromPage = 'results';
      this.recipeIdFrom = recipeId;
    } else if (queryFrom === 'recipe' && recipeId) {
      this.fromPage = 'recipe';
      this.recipeIdFrom = recipeId;
    } else {
      this.fromPage = 'home';
    }

    console.log('🧭 Cookbook geöffnet von:', this.fromPage, 'recipeId:', this.recipeIdFrom);
  }

  goBackToResults() {
    if (this.fromPage === 'results' && this.recipeIdFrom) {
      // 👇 Nutzer kam ursprünglich aus Results → gehe zurück ins Rezept mit from=results
      this.router.navigate(['/recipe', this.recipeIdFrom], {
        queryParams: { from: 'results' },
      });
    } else if (this.fromPage === 'recipe' && this.recipeIdFrom) {
      // 👇 Nutzer kam aus einem Rezept (nicht aus Results)
      this.router.navigate(['/recipe', this.recipeIdFrom], {
        queryParams: { from: 'cookbook' },
      });
    } else {
      // 👇 Standard-Fall (z. B. direkt von Home)
      this.router.navigate(['/home']);
    }
  }

  generateNewRecipe() {
    this.router.navigate(['/step1']);
  }

  openRecipe(recipe: StoredRecipe) {
    // 👇 Beim Öffnen eines Rezepts aus dem Cookbook
    // wird IMMER "from=cookbook" gesetzt (nicht results)
    this.router.navigate(['/recipe', recipe.recipe_id], {
      queryParams: { from: 'cookbook' },
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
