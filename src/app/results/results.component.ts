import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDataService } from '../services/recipe-data.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  recipe: any = null;

  constructor(private recipeService: RecipeDataService) {}

  ngOnInit() {
    this.recipe = this.recipeService.getResult();
    console.log('📦 Loaded recipe:', this.recipe);
  }
}
