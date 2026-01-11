import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecipeDataService } from '../services/recipe-data.service';
import { FirestoreUsageService } from '../services/firestore-usage.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  showIngredientWarning = false;
  generateDisabled = false;
  remainingTries = 0;
  private usageLimit = 0;

  constructor(
    private recipeService: RecipeDataService,
    private http: HttpClient,
    private router: Router,
    private firestoreUsage: FirestoreUsageService
  ) { }

  async ngOnInit() {
    const prefs = this.recipeService.getPreferences();
    this.portionCount = prefs.portions;
    this.personCount = prefs.persons;
    this.selectedCookingTimes = [...prefs.cookingTimes];
    this.selectedCuisines = [...prefs.cuisines];
    this.selectedDiets = [...prefs.diets];
    this.resetUI();

    this.usageLimit = this.firestoreUsage.getLimit();
    const usage = await this.firestoreUsage.getCurrentUsageCount();
    this.remainingTries = Math.max(this.usageLimit - usage, 0);
    this.generateDisabled = this.remainingTries <= 0;
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

  async generateRecipe() {
    if (this.generateDisabled) {
      alert('⚠️ Du hast dein tägliches Limit erreicht!');
      return;
    }

    const ingredients = this.recipeService.getIngredients();
    if (!ingredients || ingredients.length < 1) {
      this.showIngredientWarning = true;
      return;
    }

    const canProceed = await this.firestoreUsage.canGenerateRecipe();
    if (!canProceed) {
      this.generateDisabled = true;
      this.remainingTries = 0;
      alert('⚠️ Du hast dein tägliches Limit erreicht!');
      return;
    }

    await this.firestoreUsage.incrementUsageCount();

    this.recipeService.setPreferences({
      portions: this.portionCount,
      persons: this.personCount,
      cookingTimes: this.selectedCookingTimes,
      cuisines: this.selectedCuisines,
      diets: this.selectedDiets,
    });

    this.recipeService.clearResult();
    const finalData = this.recipeService.getRecipeData();

    const requestData = {
      ...finalData,
      userId: this.firestoreUsage.getUserHash(),
    };

    console.log('🧾 Final Recipe JSON:', JSON.stringify(requestData, null, 2));
    this.router.navigate(['/loading-screen']);

    // ✅ Verwende Proxy-URL
    this.http
      .post(environment.apiUrl + 'webhook/recipe-generator', requestData)
      .subscribe({
        next: async (res) => {
          console.log('✅ n8n Workflow Response:', res);
          this.recipeService.setResult(res);

          const usage = await this.firestoreUsage.getCurrentUsageCount();
          this.remainingTries = Math.max(this.usageLimit - usage, 0);
          this.generateDisabled = this.remainingTries <= 0;
        },
        error: (err) => {
          console.error('❌ Fehler beim Aufruf des Workflows:', err);
        },
      });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToCookbook() {
    this.router.navigate(['/cookbook']);
  }

  goBack() {
    this.router.navigate(['/step1']);
  }

  goToStep1() {
    this.router.navigate(['/step1']);
  }
}
