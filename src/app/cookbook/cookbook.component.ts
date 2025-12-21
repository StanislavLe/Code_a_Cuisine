// src/app/cookbook/cookbook.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreRecipeService } from '../services/firestore-recipe.service';
import { StoredRecipe } from '../models/stored-recipe.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cookbook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookbook.component.html',
  styleUrls: ['./cookbook.component.scss'],
})
export class CookbookComponent implements OnInit {
  topRecipes$!: Observable<StoredRecipe[]>;

  constructor(private firestoreRecipeService: FirestoreRecipeService) {}

  ngOnInit(): void {
    this.topRecipes$ = this.firestoreRecipeService.getTopRecipes(12);
  }
}
