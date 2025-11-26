import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
export class Step1Component implements AfterViewInit {
  searchTerm = '';
  suggestions: string[] = [];
  quantity: number | null = null;
  unit = 'g';
  ingredients: Ingredient[] = [];

  dropdownVisible = false;
  dropdownRendered = false;

  dropdownOpen = false;
  unitOptions = ['g', 'ml', 'pcs'];

  editIndex: number | null = null;
  editableIngredient: Ingredient = { name: '', quantity: 0, unit: 'g' };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✅ DOM Event nur im Browser registrieren
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.custom-select-wrapper')) {
          this.dropdownOpen = false;
        }
      });
    }
  }

// 🧠 Input Autocomplete (wie gehabt)
onSearch() {
  const query = this.searchTerm.trim();

  if (!query || query.length < 2) {
    if (this.dropdownVisible) {
      this.dropdownVisible = false;
      setTimeout(() => {
        this.dropdownRendered = false;
        this.suggestions = [];
      }, 250);
    }
    return;
  }

  const url = `http://localhost:5678/webhook/ingredients?query=${encodeURIComponent(query)}`;
  this.http.get<any[]>(url).subscribe({
    next: (data) => {
      const results = data?.[0]?.queries ?? [];
      if (!results || results.length === 0) {
        this.dropdownVisible = false;
        setTimeout(() => {
          this.dropdownRendered = false;
          this.suggestions = [];
        }, 250);
        return;
      }

      this.suggestions = results;
      this.dropdownRendered = true;
      setTimeout(() => (this.dropdownVisible = true), 10);
    },
    error: (err) => {
      console.error('Fehler bei Ingredient-Request:', err);
      this.dropdownVisible = false;
      setTimeout(() => {
        this.dropdownRendered = false;
        this.suggestions = [];
      }, 250);
    },
  });
}

// 🧠 Custom Select Dropdown
toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

selectUnit(opt: string) {
  this.unit = opt;
  this.dropdownOpen = false;
}


  // 🧩 Vorschlag auswählen
  selectIngredient(item: string) {
    this.searchTerm = item;
    this.dropdownVisible = false;
    setTimeout(() => {
      this.dropdownRendered = false;
      this.suggestions = [];
    }, 250);
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
    this.searchTerm = '';
    this.quantity = null;
    this.unit = 'g';
    this.dropdownVisible = false;

    setTimeout(() => {
      this.dropdownRendered = false;
      this.suggestions = [];
    }, 250);
  }

  // 🗑️ Entfernen mit Fade-Out
  removeIngredient(index: number) {
    const element = document.querySelectorAll('.ingredient-item')[index];
    if (element) {
      element.classList.add('fade-out');
      setTimeout(() => {
        this.ingredients.splice(index, 1);
      }, 200);
    }
  }

  // ✏️ Bearbeiten starten
  startEdit(index: number) {
    this.editIndex = index;
    this.editableIngredient = { ...this.ingredients[index] };
  }

  // 💾 Änderungen speichern
  saveIngredient(index: number) {
    if (!this.editableIngredient.name.trim()) return;
    this.ingredients[index] = { ...this.editableIngredient };
    this.cancelEdit();
  }

  cancelEdit() {
    this.editIndex = null;
    this.editableIngredient = { name: '', quantity: 0, unit: 'g' };
  }



}
