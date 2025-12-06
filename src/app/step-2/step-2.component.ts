import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.scss'],
})
export class Step2Component {
  portionCount = 2;
  readonly minPortions = 1;
  readonly maxPortions = 12;

  personCount = 1;
  readonly minPersons = 1;
  readonly maxPersons = 3;

  // --- Updated state variables ---
  selectedCookingTimes: string[] = [];
  selectedCuisines: string[] = [];
  selectedDiets: string[] = [];

  // --- Portion logic ---
  increasePortions() {
    if (this.portionCount < this.maxPortions) {
      this.portionCount++;
    }
  }

  decreasePortions() {
    if (this.portionCount > this.minPortions) {
      this.portionCount--;
    }
  }

  // --- Person logic ---
  increasePersons() {
    if (this.personCount < this.maxPersons) {
      this.personCount++;
    }
  }

  decreasePersons() {
    if (this.personCount > this.minPersons) {
      this.personCount--;
    }
  }

  // --- Cooking time logic ---
  toggleCookingTime(option: string) {
    if (this.selectedCookingTimes.includes(option)) {
      this.selectedCookingTimes = this.selectedCookingTimes.filter(o => o !== option);
    } else {
      this.selectedCookingTimes.push(option);
    }
  }

  // --- Cuisine logic ---
  toggleCuisine(option: string) {
    if (this.selectedCuisines.includes(option)) {
      this.selectedCuisines = this.selectedCuisines.filter(o => o !== option);
    } else {
      this.selectedCuisines.push(option);
    }
  }

  // --- Diet preferences logic ---
  toggleDiet(option: string) {
    if (option === 'No preferences') {
      this.selectedDiets = ['No preferences'];
    } else {
      // Entferne "No preferences", wenn es existiert
      this.selectedDiets = this.selectedDiets.filter(o => o !== 'No preferences');

      if (this.selectedDiets.includes(option)) {
        // Toggle abwählen
        this.selectedDiets = this.selectedDiets.filter(o => o !== option);
      } else {
        // Hinzufügen
        this.selectedDiets.push(option);
      }
    }
  }
}
