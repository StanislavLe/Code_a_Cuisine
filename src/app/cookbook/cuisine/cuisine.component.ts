import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Cuisine {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-cuisine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuisine.component.html',
  styleUrls: ['./cuisine.component.scss'],
})
export class CuisineComponent {
  cuisines: Cuisine[] = [
    {
      id: 'italian',
      label: 'Italian cuisine',
      description: 'Pasta, Pizza & Co.',
      icon: 'assets/img/italian.png',
    },
    {
      id: 'german',
      label: 'German cuisine',
      description: 'german food',
      icon: 'assets/img/german.png',
    },
    {
      id: 'japanese',
      label: 'Japanese cuisine',
      description: 'Light and fresh dishes',
      icon: 'assets/img/japanese.png',
    },
    {
      id: 'gourmet',
      label: 'Gourmet cuisine',
      description: 'fine dishes for special occasions',
      icon: 'assets/img/gourmet.png',
    },
    {
      id: 'indian ',
      label: 'Indian cuisine',
      description: 'Flavours from south Asia',
      icon: 'assets/img/indian.png',
    },
    {
      id: 'fusion',
      label: 'Fusion cuisine',
      description: 'Flavours from around the world',
      icon: 'assets/img/fusion.png',
    }
  ];

  constructor(private router: Router) { }

  onSelectCuisine(cuisine: Cuisine) {
    // später: Navigate zu gefilterter Rezeptliste
    this.router.navigate(['/recipe-list'], {
      queryParams: { cuisine: cuisine.id },
    });
  }
}
