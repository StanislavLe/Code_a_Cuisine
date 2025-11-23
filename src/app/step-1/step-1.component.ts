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
  styleUrls: ['./step-1.component.scss'],
})
export class Step1Component {
  searchTerm = '';
  suggestions: string[] = [];
  quantity: number | null = null;
  unit = 'g';
  ingredients: Ingredient[] = [];

  constructor(private http: HttpClient) { }

  dropdownVisible = false;

onSearch() {
  const query = this.searchTerm.trim();

  // 🟥 Wenn leer -> sanft ausblenden
  if (!query || query.length < 2) {
    if (this.dropdownVisible) {
      this.dropdownVisible = false;

      // ⏳ Warte, bis Fade-Out fertig ist, dann Suggestions löschen
      setTimeout(() => {
        this.suggestions = [];
      }, 250);
    }
    return;
  }

  // 🟢 Wenn Eingabe valide -> Daten holen
  const url = `http://localhost:5678/webhook/ingredients?query=${query}`;
  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      const results = data?.[0]?.queries ?? [];
      if (results.length === 0) {
        // Nichts gefunden -> sanft ausblenden
        this.dropdownVisible = false;
        setTimeout(() => (this.suggestions = []), 250);
        return;
      }

      // Neue Ergebnisse -> Dropdown anzeigen
      this.suggestions = results;
      setTimeout(() => (this.dropdownVisible = true), 10);
    },
    error: (err) => {
      console.error('Fehler bei Ingredient-Request:', err);
      this.dropdownVisible = false;
      setTimeout(() => (this.suggestions = []), 250);
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

  removeIngredient(index: number) {
    const element = document.querySelectorAll('.ingredient-item')[index];
    if (element) {
      element.classList.add('fade-out');
      setTimeout(() => {
        this.ingredients.splice(index, 1);
      }, 200); // ⏱ gleiche Dauer wie deine fadeOut Animation
    }
  }



  editIndex: number | null = null;
  editableIngredient: Ingredient = { name: '', quantity: 0, unit: 'g' };

  // ✏️ Bearbeiten starten
  startEdit(index: number) {
    this.editIndex = index;
    this.editableIngredient = { ...this.ingredients[index] };
  }

  // 💾 Änderungen speichern
  saveIngredient(index: number) {
    if (!this.editableIngredient.name.trim()) return;

    this.ingredients[index] = { ...this.editableIngredient };
    this.editIndex = null;
    this.editableIngredient = { name: '', quantity: 0, unit: 'g' };
  }

  // ❌ Abbrechen
  cancelEdit() {
    this.editIndex = null;
    this.editableIngredient = { name: '', quantity: 0, unit: 'g' };
  }

}


