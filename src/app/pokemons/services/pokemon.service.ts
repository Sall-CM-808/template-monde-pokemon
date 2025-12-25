import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Pokemon, 
  PokemonResume, 
  PokemonStat,
  PokemonListeApiResponse, 
  PokemonDetailApiResponse 
} from '../models/pokemon.model';

// Service pour récupérer les données des pokémons
@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiPokemon;

  // Récupère la liste des 200 premiers pokémons
  getListe(): Observable<PokemonResume[]> {
    const url = `${this.apiUrl}/pokemon?limit=200&offset=0`;

    return this.http.get<PokemonListeApiResponse>(url).pipe(
      map(data => data.results.map((p, index) => this.transformerResume(p, index + 1))),
      catchError(err => {
        console.error('Erreur API pokémons:', err);
        return throwError(() => err);
      })
    );
  }

  // Récupère le détail d'un pokémon par son ID
  getParId(id: number): Observable<Pokemon> {
    const url = `${this.apiUrl}/pokemon/${id}`;

    return this.http.get<PokemonDetailApiResponse>(url).pipe(
      map(data => this.transformerDetail(data)),
      catchError(err => {
        console.error('Erreur API pokémon:', err);
        return throwError(() => err);
      })
    );
  }

  // Transforme la réponse API en PokemonResume
  private transformerResume(p: { name: string; url: string }, id: number): PokemonResume {
    return {
      id,
      nom: this.capitaliser(p.name),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      url: p.url
    };
  }

  // Transforme la réponse API en Pokemon complet
  private transformerDetail(data: PokemonDetailApiResponse): Pokemon {
    const stats: PokemonStat[] = data.stats.map(s => ({
      nom: this.traduireStat(s.stat.name),
      valeur: s.base_stat
    }));

    return {
      id: data.id,
      nom: this.capitaliser(data.name),
      image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      imageShiny: data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny,
      taille: data.height / 10, // décimètres -> mètres
      poids: data.weight / 10, // hectogrammes -> kg
      types: data.types.map(t => this.traduireType(t.type.name)),
      capacites: data.abilities.map(a => this.capitaliser(a.ability.name.replace('-', ' '))),
      stats
    };
  }

  // Capitalise la première lettre
  private capitaliser(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Traduit les noms de stats en français
  private traduireStat(nom: string): string {
    const traductions: Record<string, string> = {
      'hp': 'PV',
      'attack': 'Attaque',
      'defense': 'Défense',
      'special-attack': 'Att. Spé.',
      'special-defense': 'Déf. Spé.',
      'speed': 'Vitesse'
    };
    return traductions[nom] || nom;
  }

  // Traduit les types en français
  private traduireType(type: string): string {
    const traductions: Record<string, string> = {
      'normal': 'Normal',
      'fire': 'Feu',
      'water': 'Eau',
      'electric': 'Électrik',
      'grass': 'Plante',
      'ice': 'Glace',
      'fighting': 'Combat',
      'poison': 'Poison',
      'ground': 'Sol',
      'flying': 'Vol',
      'psychic': 'Psy',
      'bug': 'Insecte',
      'rock': 'Roche',
      'ghost': 'Spectre',
      'dragon': 'Dragon',
      'dark': 'Ténèbres',
      'steel': 'Acier',
      'fairy': 'Fée'
    };
    return traductions[type] || this.capitaliser(type);
  }
}
