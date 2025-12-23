import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Cuisine } from '../../../models/cuisine.model';
import { cuisines } from '../cuisine-data';
import { FirestoreRecipeService } from '../../../services/firestore-recipe.service';
import { StoredRecipe } from '../../../models/stored-recipe.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
})
export class RecipeListComponent implements OnInit {
  selectedCuisine?: Cuisine;
  recipes$!: Observable<StoredRecipe[]>;

  // Pagination
  page = 1;
  pageSize = 12;

  allRecipes: StoredRecipe[] = [];   // alle Rezepte der Cuisine
  pagedRecipes: StoredRecipe[] = []; // aktueller Seiten-Slice
  totalPages = 1;
  pages: number[] = [];              // [1, 2, 3, ...]

  constructor(
    private route: ActivatedRoute,
    private firestoreRecipeService: FirestoreRecipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const cuisineId = this.route.snapshot.queryParamMap.get('cuisine');

    if (cuisineId) {
      this.selectedCuisine = cuisines.find((c) => c.id === cuisineId);

      this.recipes$ = this.firestoreRecipeService.getRecipesByCuisine(cuisineId);

      this.recipes$.subscribe((recipes) => {
        this.allRecipes = recipes;

        this.totalPages = Math.ceil(recipes.length / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        this.page = 1; // sicherheitshalber auf Seite 1
        this.updatePagedRecipes();
      });
    }
  }

  private updatePagedRecipes() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRecipes = this.allRecipes.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePagedRecipes();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePagedRecipes();
    }
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.updatePagedRecipes();
    }
  }

  goBack() {
    window.history.back();
  }

  generateNewRecipe() {
    this.router.navigate(['/step1']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

openRecipe(recipe: StoredRecipe) {
  this.router.navigate(['/recipe', recipe.recipe_id], {
    state: {
      from: 'recipe-list',
      cuisineId: this.selectedCuisine?.id, // damit wir wieder in die richtige Liste kommen
    },
  });
}


}
