import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cuisine } from '../../models/cuisine.model';
import { cuisines } from './cuisine-data';

@Component({
  selector: 'app-cuisine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuisine.component.html',
  styleUrls: ['./cuisine.component.scss'],
})
export class CuisineComponent {
  cuisines: Cuisine[] = cuisines;  // 👈 zentrale Datenquelle nutzen

  constructor(private router: Router) {}

  onSelectCuisine(cuisine: Cuisine) {
    this.router.navigate(['/recipe-list'], {
      queryParams: { cuisine: cuisine.id },
    });
  }
}
