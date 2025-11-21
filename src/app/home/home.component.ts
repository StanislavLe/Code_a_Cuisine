import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookbookComponent } from '../cookbook/cookbook.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CookbookComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
