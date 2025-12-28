import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecipeDataService } from '../services/recipe-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.scss'],
})
export class Step2Component implements OnInit {
  portionCount = 2;
  readonly minPortions = 1;
  readonly maxPortions = 12;

  personCount = 1;
  readonly minPersons = 1;
  readonly maxPersons = 4;

  selectedCookingTimes: string[] = [];
  selectedCuisines: string[] = [];
  selectedDiets: string[] = [];

  constructor(
    private recipeService: RecipeDataService,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
    const prefs = this.recipeService.getPreferences();
    this.portionCount = prefs.portions;
    this.personCount = prefs.persons;
    this.selectedCookingTimes = [...prefs.cookingTimes];
    this.selectedCuisines = [...prefs.cuisines];
    this.selectedDiets = [...prefs.diets];
    this.resetUI();
  }

  private resetUI() {
    this.portionCount = 2;
    this.personCount = 1;
    this.selectedCookingTimes = [];
    this.selectedCuisines = [];
    this.selectedDiets = [];
  }

  increasePortions() {
    if (this.portionCount < this.maxPortions) this.portionCount++;
  }

  decreasePortions() {
    if (this.portionCount > this.minPortions) this.portionCount--;
  }

  increasePersons() {
    if (this.personCount < this.maxPersons) this.personCount++;
  }

  decreasePersons() {
    if (this.personCount > this.minPersons) this.personCount--;
  }

  toggleCookingTime(option: string) {
    if (this.selectedCookingTimes.includes(option))
      this.selectedCookingTimes = this.selectedCookingTimes.filter(o => o !== option);
    else this.selectedCookingTimes.push(option);
  }

  toggleCuisine(option: string) {
    if (this.selectedCuisines.includes(option))
      this.selectedCuisines = this.selectedCuisines.filter(o => o !== option);
    else this.selectedCuisines.push(option);
  }

  toggleDiet(option: string) {
    if (option === 'No preferences') {
      this.selectedDiets = ['No preferences'];
    } else {
      this.selectedDiets = this.selectedDiets.filter(o => o !== 'No preferences');
      if (this.selectedDiets.includes(option))
        this.selectedDiets = this.selectedDiets.filter(o => o !== option);
      else this.selectedDiets.push(option);
    }
  }

generateRecipe() {
  this.recipeService.setPreferences({
    portions: this.portionCount,
    persons: this.personCount,
    cookingTimes: this.selectedCookingTimes,
    cuisines: this.selectedCuisines,
    diets: this.selectedDiets,
  });

  this.recipeService.clearResult();
  const finalData = this.recipeService.getRecipeData();
  console.log('🧾 Final Recipe JSON:', JSON.stringify(finalData, null, 2));
  this.router.navigate(['/loading-screen']);
  this.http
    .post('http://localhost:5678/webhook/recipe-generator', finalData)
    .subscribe({
      next: (res) => {
        console.log('✅ n8n Workflow Response:', res);
        this.recipeService.setResult(res);
      },
      error: (err) => {
        console.error('❌ Fehler beim Aufruf des Workflows:', err);
      },
    });
}

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    this.router.navigate(['/step1']);
  }
}
