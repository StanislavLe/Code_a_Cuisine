import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // 👈 Router hier zusammen importieren
import { RecipeDataService } from '../services/recipe-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent implements OnInit {
  recipe: any = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeDataService,
    private router: Router           // 👈 HIER FEHLTE DER ROUTER
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📥 Recipe ID from route:', id);

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

    this.recipe = allRecipes.find(r => r.recipe_id === id);
    console.log('🎯 Selected recipe:', this.recipe);
  }

  goBack() {
    this.router.navigate(['/results']);
  }
}
