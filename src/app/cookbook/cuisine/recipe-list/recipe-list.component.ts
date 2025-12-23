import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private firestoreRecipeService: FirestoreRecipeService
  ) { }

ngOnInit(): void {
  const cuisineId = this.route.snapshot.queryParamMap.get('cuisine');

  if (cuisineId) {
    this.selectedCuisine = cuisines.find((c) => c.id === cuisineId);

    this.recipes$ = this.firestoreRecipeService.getRecipesByCuisine(cuisineId);

    this.recipes$.subscribe(recipes => {
      this.totalPages = Math.ceil(recipes.length / this.pageSize);

      // Seitenliste erzeugen (1, 2, 3, …)
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

      this.updatePagedRecipes(recipes);
    });
  }
}



  updatePagedRecipes(recipes: StoredRecipe[]) {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRecipes = recipes.slice(start, end);
  }



  goBack() {
    window.history.back();
  }


  page = 1;
  pageSize = 12;

  pagedRecipes: StoredRecipe[] = [];
  totalPages = 1;
  pages: number[] = [];




  nextPage() {
    this.page++;
    this.recipes$.subscribe(recipes => this.updatePagedRecipes(recipes));
  }

  prevPage() {
    this.page--;
    this.recipes$.subscribe(recipes => this.updatePagedRecipes(recipes));
  }


  goToPage(pageNumber: number) {
  this.page = pageNumber;

  this.recipes$.subscribe(recipes => {
    this.updatePagedRecipes(recipes);
  });
}

}
