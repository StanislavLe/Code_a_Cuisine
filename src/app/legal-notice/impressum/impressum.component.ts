import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss']
})
export class ImpressumComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  /**
   * Navigiert zur Startseite (Home)
   */
  goHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Navigiert zur vorherigen Seite oder zurück zur Startseite
   */
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();  // 👈 nutzt Browser-History (Angular-sicher)
    } else {
      this.router.navigate(['/home']); // 👈 Fallback, wenn History leer
    }
  }
}
