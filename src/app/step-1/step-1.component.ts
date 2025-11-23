import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string;
}

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-1.component.html',
  styleUrls: ['./step-1.component.scss']
})
export class Step1Component {
  searchTerm = '';
  suggestions: string[] = [];
  quantity: number | null = null;
  unit = 'g';
  ingredients: Ingredient[] = [];

  constructor(private http: HttpClient) { }

  onSearch() {
    if (this.searchTerm.length < 2) {
      this.suggestions = [];
      return;
    }
    const url = `http://localhost:5678/webhook-test/ingredients?query=${this.searchTerm}`;
    this.http.get<string[]>(url).subscribe({
      next: (data) => (this.suggestions = data),
      error: (err) => console.error(err)
    });
  }

  selectIngredient(item: string) {
    this.searchTerm = item;
    this.suggestions = [];
  }

  addIngredient() {
    if (!this.searchTerm.trim()) return;
    const ingredient: Ingredient = {
      name: this.searchTerm.trim(),
      quantity: this.quantity ?? 0,
      unit: this.unit
    };
    this.ingredients.push(ingredient);
    this.searchTerm = '';
    this.quantity = null;
    this.unit = 'g';
  }

  removeIngredient(index: number) {
    this.ingredients.splice(index, 1);
  }
}
