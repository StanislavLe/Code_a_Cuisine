import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreRecipeService } from '../services/firestore-recipe.service';
import { StoredRecipe } from '../models/stored-recipe.model';
import { Observable } from 'rxjs';
import { CuisineComponent } from './cuisine/cuisine.component';
import { Location } from '@angular/common';

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
    private location: Location,          // 👈 Location für „echtes“ Zurück
  ) {}

  ngOnInit(): void {
    this.topRecipes$ = this.firestoreRecipeService.getTopRecipes(12);
  }

  goBack() {
    this.location.back();               // 👈 geht zur vorherigen Seite im Browser-Stack
  }
}
