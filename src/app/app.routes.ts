import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { NonTrouveComponent } from './pages/non-trouve/non-trouve.component';

// Routes principales de l'application
export const routes: Routes = [
  // Accueil
  { path: '', component: AccueilComponent },

  // Auth
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  
  // Module Pays (lazy loading)
  { 
    path: 'pays', 
    loadChildren: () => import('./pays/pays.routes').then(m => m.paysRoutes) 
  },
  
  // Module Pokémons (lazy loading)
  { 
    path: 'pokemons', 
    loadChildren: () => import('./pokemons/pokemons.routes').then(m => m.pokemonsRoutes) 
  },
  
  // Route 404 - doit être en dernier
  { path: '**', component: NonTrouveComponent }
];
