import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { NonTrouveComponent } from './pages/non-trouve/non-trouve.component';
import { FavorisComponent } from './pages/favoris/favoris.component';
import { authGuard } from './shared/guards/auth.guard';

// Routes principales de l'application
export const routes: Routes = [
  // Accueil (protégée)
  { 
    path: '', 
    component: AccueilComponent,
    canActivate: [authGuard]
  },

  // Favoris (protégée)
  { 
    path: 'favoris', 
    component: FavorisComponent,
    canActivate: [authGuard]
  },

  // Auth (publiques)
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  
  // Module Pays (lazy loading, protégé)
  { 
    path: 'pays', 
    loadChildren: () => import('./pays/pays.routes').then(m => m.paysRoutes),
    canActivate: [authGuard]
  },
  
  // Module Pokémons (lazy loading, protégé)
  { 
    path: 'pokemons', 
    loadChildren: () => import('./pokemons/pokemons.routes').then(m => m.pokemonsRoutes),
    canActivate: [authGuard]
  },
  
  // Route 404 - doit être en dernier
  { path: '**', component: NonTrouveComponent }
];
