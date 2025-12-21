import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // 👈 Router hier zusammen importieren
import { RecipeDataService } from '../services/recipe-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent implements OnInit {
  recipe: any = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeDataService,
    private router: Router   
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📥 Recipe ID from route:', id);

    const result = this.recipeService.getResult();
    console.log('📦 Full result in RecipeComponent:', result);

    let allRecipes: any[] = [];

    if (Array.isArray(result)) {
      allRecipes = result;
    } else if (result?.recipes && Array.isArray(result.recipes)) {
      allRecipes = result.recipes;
    } else if (result) {
      allRecipes = [result];
    }

    this.recipe = allRecipes.find(r => r.recipe_id === id);
    console.log('🎯 Selected recipe:', this.recipe);
  }

  goBack() {
    this.router.navigate(['/results']);
  }


  chefIconPaths: string[] = [
  '../../assets/img/chef1.png',
  '../../assets/img/chef2.png',
  '../../assets/img/chef3.png',
  '../../assets/img/chef4.png',
];

getVisibleChefIcons(): string[] {
  const helpers = Number(this.recipe?.helpers ?? 0);
  const cooksToShow = Math.min(helpers, this.chefIconPaths.length);
  return this.chefIconPaths.slice(0, cooksToShow);
}

getChefImage(role: string): string {
  const key = role.toLowerCase();
  if (key.includes('helfer 1')) return '../../assets/img/chef1.png';
  if (key.includes('helfer 2')) return '../../assets/img/chef2.png';
  if (key.includes('helfer 3')) return '../../assets/img/chef3.png';
  if (key.includes('helfer 4')) return '../../assets/img/chef4.png';
  return '../../assets/img/default_chef.png'; // fallback
}


get groupedInstructions() {
  const groups: { [key: string]: any[] } = {};
 this.recipe.instructions.forEach((inst: any) => {
  if (!groups[inst.assigned_to]) groups[inst.assigned_to] = [];
  groups[inst.assigned_to].push(inst);
});
  return groups;
}

  generateNewRecipe() {
    this.router.navigate(['/step1']);
        this.recipeService.reset();
  }


  goToCookbook() {
    this.router.navigate(['/cookbook']);
  }
}
