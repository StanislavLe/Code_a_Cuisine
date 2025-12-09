import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { RecipeDataService } from '../services/recipe-data.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  loadingText = 'Generating your recipe...';

  constructor(private recipeService: RecipeDataService, private router: Router) {}

  ngOnInit() {

    this.sub = this.recipeService.isRecipeReady().subscribe((ready) => {
      if (ready) {
        console.log('✅ Rezeptdaten empfangen, gehe zu Results...');
        this.router.navigate(['/results']);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
