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
  ) {}

ngOnInit(): void {
  const cuisineId = this.route.snapshot.queryParamMap.get('cuisine');
  console.log('🔍 cuisineId from route:', cuisineId);

  if (cuisineId) {
    this.selectedCuisine = cuisines.find((c) => c.id === cuisineId);
    console.log('🔍 selectedCuisine:', this.selectedCuisine);

    this.recipes$ = this.firestoreRecipeService.getRecipesByCuisine(cuisineId);
  }
}


  goBack() {
    window.history.back();
  }
}
