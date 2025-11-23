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

  // 🧠 Eingabeüberwachung + Request an n8n/Gemini
  
 onSearch() {
  // Sofort schließen, wenn leer
  if (!this.searchTerm?.trim()) {
    this.suggestions = [];
    return;
  }

  if (this.searchTerm.length < 2) {
    this.suggestions = [];
    return;
  }

  const url = `http://localhost:5678/webhook/ingredients?query=${this.searchTerm}`;
  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      if (!data || !Array.isArray(data) || data.length === 0 || !data[0]?.queries) {
        this.suggestions = [];
        return;
      }
      this.suggestions = data[0].queries;
    },
    error: (err) => {
      console.error('Fehler bei Ingredient-Request:', err);
      this.suggestions = [];
    },
  });
}



  // 🧩 Vorschlag auswählen
  selectIngredient(item: string) {
    this.searchTerm = item;
    this.suggestions = [];
  }

  // ➕ Ingredient hinzufügen
  addIngredient() {
    const name = this.searchTerm.trim();
    if (!name) return;

    const ingredient: Ingredient = {
      name,
      quantity: this.quantity ?? 0,
      unit: this.unit,
    };

    this.ingredients.push(ingredient);

    // Reset
    this.searchTerm = '';
    this.quantity = null;
    this.unit = 'g';
    this.suggestions = [];
  }

  // ❌ Ingredient löschen
  removeIngredient(index: number) {
    this.ingredients.splice(index, 1);
  }
}
