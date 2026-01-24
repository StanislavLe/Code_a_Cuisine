# Code a Cuisine - AI Agent Instructions

## Project Overview

Code a Cuisine is an **Angular 17 recipe discovery application** with SSR (Server-Side Rendering) that helps users find recipes based on ingredients, preferences, and cuisines. The app combines a multi-step form workflow with a Firestore backend for storing liked recipes and usage analytics.

### Key Stack
- **Framework**: Angular 17 (standalone components, v17 bootstrap)
- **Backend**: Firebase/Firestore for recipe storage, user likes, and analytics
- **Workflow Engine**: N8N (Docker-based) for recipe search/generation
- **Deployment**: Docker + NGINX (SSR-enabled)

## Architecture Patterns

### Data Flow: Multi-Step Form → Results → Recipe Details

1. **Step 1** (`step-1.component`) - Collect ingredients and portions
2. **Step 2** (`step-2.component`) - Select preferences (cuisines, diets, cooking times)
3. **Loading Screen** - Waits for N8N workflow to process
4. **Results** - Displays recipe cards from N8N output
5. **Recipe Details** - Shows full recipe; liking triggers Firestore save

**Key Service**: `RecipeDataService` (provides: `Root`) manages the complete data flow across steps using `BehaviorSubject` for `recipeReady$` and localStorage persistence. Always check `getRecipeData()` when accessing form state across components.

### Central State Management

**`RecipeDataService`** manages:
- `ingredients`: Array with `{name, quantity, unit}`
- `preferences`: `{portions, persons, cookingTimes[], cuisines[], diets[]}`
- `result`: Recipe results from N8N

**Pattern**: Components inject `RecipeDataService` and call `setIngredients()`, `setPreferences()`, `setResult()` to update state. The service persists to localStorage (browser-only via `isPlatformBrowser` check for SSR compatibility).

### Firebase Integration

**`FirestoreRecipeService`** handles:
- **Saving liked recipes**: `saveLikedRecipe(recipe, inputData, clientId)` - prevents duplicate likes using composite key `${clientId}_${recipe_id}`
- **Tracking likes**: `increment()` updates recipe likes counter
- **Usage tracking**: `FirestoreUsageService` logs user interactions
- **Recipe queries**: Filters by cuisine via `cuisine-data.ts` mapping (normalizes raw input to cuisine IDs)

**Important**: Firestore collections are `recipes`, `userLikes`, and `usageData`. Always use `@angular/fire` methods (`getDoc`, `setDoc`, `docData`). The service includes error handling with console logging (❌ for errors, ✅ for success).

## Component Structure & Routing

### Routes (app.routes.ts)
- `home` - Landing page
- `step1`, `step2` - Form workflow
- `loading-screen` - N8N processing wait
- `results` - Recipe grid (uses `recipe-card` child component)
- `recipe/:id` - Single recipe detail page
- `cookbook` → `cuisine` → `recipe-list` - Browse/filter recipes
- Legal pages: `impressum`, `privacy-policy`, `cookie-policy`, `terms`

### AppComponent Pattern
Uses `routeClass` binding to add route-specific CSS classes (e.g., `route-home`, `route-results`) for styling via `RouterOutlet`. Footer is always present as standalone component.

## Critical Developer Workflows

### Local Development
```bash
npm start          # Runs `ng serve` on http://localhost:4200
npm run build      # Production build (SSR optimized)
npm run watch      # Build in watch mode
npm test           # Karma + Jasmine unit tests
```

### Docker Stack
```bash
docker-compose up  # Starts frontend (NGINX SSR) + N8N at http://localhost:8080
```
N8N runs on port 5678 (admin/test123 by default). Frontend proxies recipe requests to N8N via webhook URL.

### Testing Pattern
- Unit tests: `*.spec.ts` files use Jasmine/Karma
- Components: Import `CommonModule`, standalone dependencies
- Services: Provide `root` singleton, mock Firestore in tests using `@angular/fire/testing`

## Styling & Component Conventions

- **SCSS only** (configured in `angular.json` → `inlineStyleLanguage: "scss"`)
- **Standalone components**: Import `CommonModule`, `FormsModule`, etc. explicitly (no `NgModule`)
- **Component selector prefix**: `app-*` (e.g., `app-recipe-card`)
- **Font**: Quicksand (in `src/assets/fonts/quicksand/`)

## Models & Type Safety

Check `src/app/models/` for interfaces:
- `RecipeData` - Input form data + preferences + results
- `StoredRecipe` - Firestore schema with likes, cuisine, metadata
- `Cuisine` - From `cuisine-data.ts` with `{id, label}` structure

**Important**: Cuisine matching is case-insensitive; raw user input is normalized via:
```typescript
cuisines.find(c => c.id.toLowerCase() === rawInput?.toLowerCase())?.id
```

## N8N Integration

The workflow engine (N8N) handles recipe search/generation. The app:
1. Sends form data to N8N webhook endpoint
2. N8N processes and returns recipe array
3. Frontend receives via HTTP response and stores in `RecipeDataService.setResult()`

**Webhook URL** in docker-compose: `http://localhost:8080/api/` (adjust for production).

## SSR Considerations

- **PlatformID check**: `isPlatformBrowser()` required for localStorage access (see `RecipeDataService`)
- **Server-side only**: Avoid `window`, `document` without platform checks
- **Bootstrap**: Uses `bootstrapApplication()` in `main.ts` with providers for Router, Firebase, Firestore
- **Server entry**: `main.server.ts` and `app.config.server.ts` handle server-side rendering

## Common Tasks

### Add a new recipe filter step
1. Create component in `src/app/step-X/`
2. Inject `RecipeDataService`
3. Call `setPreferences()` on form submit
4. Add route to `app.routes.ts`
5. Link navigation from previous step

### Save recipe interaction to Firestore
1. Use `FirestoreRecipeService.saveLikedRecipe(recipe, inputData, clientId)`
2. Generate clientId via `crypto.randomUUID()` or read from user session
3. Handle duplicate like check (service prevents re-saves)

### Add new cuisine filter
1. Update `src/app/cookbook/cuisine/cuisine-data.ts` with `{id, label}`
2. Use in preference selection (step-2)
3. Firestore queries automatically filter by normalized cuisine ID
