import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 wichtig!

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentRoute = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  get footerClass(): string {
    if (this.currentRoute.includes('/home')) return 'footer-home';
    if (this.currentRoute.includes('/step1')) return 'footer-step1';
    if (this.currentRoute.includes('/step2')) return 'footer-step2';
    if (this.currentRoute.includes('/results')) return 'footer-results';
    if (this.currentRoute.includes('/cookbook')) return 'footer-cookbook';
    if (this.currentRoute.includes('/recipe')) return 'footer-recipe';
    return 'footer-default';
  }
}
