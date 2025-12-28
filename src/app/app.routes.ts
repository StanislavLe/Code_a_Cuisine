import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { Step1Component } from './step-1/step-1.component';
import { Step2Component } from './step-2/step-2.component';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { ResultsComponent } from './results/results.component';
import { RecipeComponent } from './recipe/recipe.component';
import { CookbookComponent } from './cookbook/cookbook.component';
import { CuisineComponent } from './cookbook/cuisine/cuisine.component';
import { RecipeListComponent } from './cookbook/cuisine/recipe-list/recipe-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'step1', component: Step1Component },
  { path: 'step2', component: Step2Component },
  { path: 'loading-screen', component: LoadingScreenComponent },
  { path: 'results', component: ResultsComponent },
  { path: 'recipe/:id', component: RecipeComponent },
  { path: 'cookbook', component: CookbookComponent },
  { path: 'cuisine', component: CuisineComponent },
  { path: 'recipe-list', component: RecipeListComponent },
  { path: '**', redirectTo: 'home' }
];
