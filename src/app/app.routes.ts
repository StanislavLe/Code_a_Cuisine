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
import { ImpressumComponent } from './legal-notice/impressum/impressum.component';
import { PrivacyPolicyComponent } from './legal-notice/privacy-policy/privacy-policy.component';
import { CookiePolicyComponent } from './legal-notice/cookie-policy/cookie-policy.component';
import { TermsComponent } from './legal-notice/terms/terms.component';

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
  { path: 'impressum', component: ImpressumComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: 'home' }
];
