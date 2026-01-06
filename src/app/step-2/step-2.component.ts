// src/app/step2/step-2.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecipeDataService } from '../services/recipe-data.service';
import { FirestoreUsageService } from '../services/firestore-usage.service';
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

  showIngredientWarning = false;
  generateDisabled = false; // 🔒 Button-Sperre
  remainingTries = 0; // 🔢 Anzeige verbleibender Versuche
  private usageLimit = 0;

  constructor(
    private recipeService: RecipeDataService,
    private http: HttpClient,
    private router: Router,
    private firestoreUsage: FirestoreUsageService
  ) {}

  /** Initialisierung beim Laden der Seite */
async ngOnInit() {
  const prefs = this.recipeService.getPreferences();
  this.portionCount = prefs.portions;
  this.personCount = prefs.persons;
  this.selectedCookingTimes = [...prefs.cookingTimes];
  this.selectedCuisines = [...prefs.cuisines];
  this.selectedDiets = [...prefs.diets];
  this.resetUI();

  this.usageLimit = this.firestoreUsage.getLimit();

  // 🔹 Versuche sofort, Zähler zu laden
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

  // --- UI Helper-Methoden ---
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

  // --- Rezept-Generierung mit Limitprüfung ---
  async generateRecipe() {
    if (this.generateDisabled) {
      alert('⚠️ Du hast dein tägliches Limit erreicht!');
      return;
    }

    // 🔹 Prüfe in Firestore, ob neuer Request erlaubt ist
    const canProceed = await this.firestoreUsage.canGenerateRecipe();
    if (!canProceed) {
      this.generateDisabled = true;
      this.remainingTries = 0;
      return;
    }

    // 🔸 Prüfe, ob Zutaten vorhanden sind
    const ingredients = this.recipeService.getIngredients();
    if (!ingredients || ingredients.length < 1) {
      this.showIngredientWarning = true;
      return;
    }

    // 🔹 Benutzereinstellungen speichern
    this.recipeService.setPreferences({
      portions: this.portionCount,
      persons: this.personCount,
      cookingTimes: this.selectedCookingTimes,
      cuisines: this.selectedCuisines,
      diets: this.selectedDiets,
    });

    this.recipeService.clearResult();
    const finalData = this.recipeService.getRecipeData();

    // 🔸 Nutzer-Hash anhängen
    const requestData = {
      ...finalData,
      userId: this.firestoreUsage.getUserHash(),
    };

    console.log('🧾 Final Recipe JSON:', JSON.stringify(requestData, null, 2));

    this.router.navigate(['/loading-screen']);

    // 🔸 n8n Workflow aufrufen
    this.http
      .post('http://localhost:5678/webhook/recipe-generator', requestData)
      .subscribe({
        next: async (res) => {
          console.log('✅ n8n Workflow Response:', res);
          this.recipeService.setResult(res);

          // 🔁 Zähler aktualisieren
          const usage = await this.firestoreUsage.getCurrentUsageCount();
          this.remainingTries = Math.max(this.usageLimit - usage, 0);
          this.generateDisabled = this.remainingTries <= 0;
        },
        error: (err) => {
          console.error('❌ Fehler beim Aufruf des Workflows:', err);
        },
      });
  }

  // --- Navigation ---
  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    this.router.navigate(['/step1']);
  }

  goToStep1() {
    this.router.navigate(['/step1']);
  }
}
