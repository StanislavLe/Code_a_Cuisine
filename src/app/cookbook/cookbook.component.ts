import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreRecipeService } from '../services/firestore-recipe.service';
import { StoredRecipe } from '../models/stored-recipe.model';
import { Observable } from 'rxjs';
import { CuisineComponent } from './cuisine/cuisine.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cookbook',
  standalone: true,
  imports: [CommonModule, CuisineComponent],
  templateUrl: './cookbook.component.html',
  styleUrls: ['./cookbook.component.scss'],
})
export class CookbookComponent implements OnInit {
  topRecipes$!: Observable<StoredRecipe[]>;

  constructor(
    private firestoreRecipeService: FirestoreRecipeService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.topRecipes$ = this.firestoreRecipeService.getTopRecipes(3);
  }

  goBack() {
    this.location.back();
  }

  goBackToResults() {
    this.router.navigate(['/results']);
  }

  generateNewRecipe() {
    this.router.navigate(['/step1']);
  }

  openRecipe(recipe: StoredRecipe) {
    this.router.navigate(['/recipe', recipe.recipe_id], {
      queryParams: { from: 'cookbook' }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
