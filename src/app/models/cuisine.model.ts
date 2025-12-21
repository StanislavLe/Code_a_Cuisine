// src/app/models/cuisine.model.ts
export interface Cuisine {
  id: string;        // zb 'italian'
  label: string;     // Anzeige-Name
  description?: string;
  icon?: string;     // Pfad zum Bild/Icon
}
