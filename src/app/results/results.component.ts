import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDataService } from '../services/recipe-data.service';
import { RecipeCardComponent } from './recipe-card/recipe-card.component'; // Pfad ggf. anpassen

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  recipe: any = null;     // rohes n8n-Result
  recipes: any[] = [];    // normalisierte Liste von Rezepten
  prefs: any = null;      // Step2-Einstellungen

  constructor(private recipeService: RecipeDataService) {}

  ngOnInit() {
    this.recipe = this.recipeService.getResult();
    this.prefs = this.recipeService.getPreferences();

    console.log('🔍 Recipe raw result:', this.recipe);
    console.log('🧾 Preferences from Step2:', this.prefs);

    // 🔧 Normalisierung:
    if (Array.isArray(this.recipe)) {
      // n8n gibt direkt ein Array zurück
      this.recipes = this.recipe;
    } else if (this.recipe?.recipes && Array.isArray(this.recipe.recipes)) {
      // n8n gibt ein Objekt mit recipes: [] zurück
      this.recipes = this.recipe.recipes;
    } else if (this.recipe) {
      // Fallback: nur 1 Rezept → trotzdem als Array behandeln
      this.recipes = [this.recipe];
    }
  }
}
