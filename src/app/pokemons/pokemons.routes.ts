import { Routes } from '@angular/router';
import { ListePokemonsComponent } from './pages/liste-pokemons/liste-pokemons.component';
import { DetailPokemonComponent } from './pages/detail-pokemon/detail-pokemon.component';

// Routes du module Pokémons
export const pokemonsRoutes: Routes = [
  { path: '', component: ListePokemonsComponent },
  { path: ':id', component: DetailPokemonComponent }
];
