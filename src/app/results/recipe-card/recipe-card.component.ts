import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JsonPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, JsonPipe],  // 👈 JSON PIPE HINZUFÜGEN
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() recipe: any;
  @Input() index: number = 1;

  constructor(private router: Router) { }

  openRecipe() {
    if (!this.recipe?.recipe_id) {
      console.warn('⚠️ recipe_id fehlt im Rezept:', this.recipe);
      return;
    }

    this.router.navigate(['/recipe', this.recipe.recipe_id], {
      state: { from: 'results' },
    });
  }
}
