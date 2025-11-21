import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { Step1Component } from './step-1/step-1.component';
import { CookbookComponent } from './cookbook/cookbook.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'step1', component: Step1Component },
  { path: 'cookbook', component: CookbookComponent },
  { path: '**', redirectTo: 'home' }
];
