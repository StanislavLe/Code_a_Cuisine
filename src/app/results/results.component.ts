import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDataService } from '../services/recipe-data.service';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  recipe: any = null;
  recipes: any[] = [];
  prefs: any = null;

  constructor(
    private recipeService: RecipeDataService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.recipe = this.recipeService.getResult();
    this.prefs = this.recipeService.getPreferences();

    // Falls jemand direkt /results aufruft oder nach Reload:
    if (!this.recipe) {
      this.router.navigate(['/step1']);
      return;
    }

    if (Array.isArray(this.recipe)) {
      this.recipes = this.recipe;
    } else if (this.recipe?.recipes && Array.isArray(this.recipe.recipes)) {
      this.recipes = this.recipe.recipes;
    } else if (this.recipe) {
      this.recipes = [this.recipe];
    }
  }

  goBack() {
    // User startet sichtbar einen neuen Prozess -> alles zurücksetzen
    this.recipeService.reset();
    this.router.navigate(['/step1']);
  }
}
