import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  routeClass = 'route-home';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.replace('/', '') || 'home';
        this.routeClass = `route-${path}`;
      }
    });
  }
}
