import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavorisService {
  private readonly CLE_POKEMONS_PREFIX = 'favoris_pokemons_';
  private readonly CLE_PAYS_PREFIX = 'favoris_pays_';

  private authSvc = inject(AuthService);

  private pokemonsFavorisSignal = signal<number[]>([]);
  private paysFavorisSignal = signal<string[]>([]);

  pokemonsFavoris = this.pokemonsFavorisSignal.asReadonly();
  paysFavoris = this.paysFavorisSignal.asReadonly();

  nombrePokemonsFavoris = computed(() => this.pokemonsFavorisSignal().length);
  nombrePaysFavoris = computed(() => this.paysFavorisSignal().length);

  constructor() {
    effect(() => {
      const session = this.authSvc.session();
      const userId = session?.userId ?? null;

      if (!userId) {
        this.pokemonsFavorisSignal.set([]);
        this.paysFavorisSignal.set([]);
        return;
      }

      this.pokemonsFavorisSignal.set(this.chargerPokemons(userId));
      this.paysFavorisSignal.set(this.chargerPays(userId));
    });
  }

  private getUserId(): string | null {
    return this.authSvc.session()?.userId ?? null;
  }

  private clePokemons(userId: string): string {
    return `${this.CLE_POKEMONS_PREFIX}${userId}`;
  }

  private clePays(userId: string): string {
    return `${this.CLE_PAYS_PREFIX}${userId}`;
  }

  private chargerPokemons(userId: string): number[] {
    try {
      const data = localStorage.getItem(this.clePokemons(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private chargerPays(userId: string): string[] {
    try {
      const data = localStorage.getItem(this.clePays(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private sauvegarderPokemons(favoris: number[]): void {
    const userId = this.getUserId();
    if (!userId) return;
    try {
      localStorage.setItem(this.clePokemons(userId), JSON.stringify(favoris));
    } catch (err) {
      console.error('Erreur sauvegarde favoris pokémons:', err);
    }
  }

  private sauvegarderPays(favoris: string[]): void {
    const userId = this.getUserId();
    if (!userId) return;
    try {
      localStorage.setItem(this.clePays(userId), JSON.stringify(favoris));
    } catch (err) {
      console.error('Erreur sauvegarde favoris pays:', err);
    }
  }

  estPokemonFavori(id: number): boolean {
    return this.pokemonsFavorisSignal().includes(id);
  }

  estPaysFavori(code: string): boolean {
    return this.paysFavorisSignal().includes(code);
  }

  basculerPokemonFavori(id: number): void {
    if (!this.getUserId()) return;
    const favoris = [...this.pokemonsFavorisSignal()];
    const index = favoris.indexOf(id);

    if (index > -1) {
      favoris.splice(index, 1);
    } else {
      favoris.push(id);
    }

    this.pokemonsFavorisSignal.set(favoris);
    this.sauvegarderPokemons(favoris);
  }

  basculerPaysFavori(code: string): void {
    if (!this.getUserId()) return;
    const favoris = [...this.paysFavorisSignal()];
    const index = favoris.indexOf(code);

    if (index > -1) {
      favoris.splice(index, 1);
    } else {
      favoris.push(code);
    }

    this.paysFavorisSignal.set(favoris);
    this.sauvegarderPays(favoris);
  }

  retirerPokemonFavori(id: number): void {
    if (!this.getUserId()) return;
    const favoris = this.pokemonsFavorisSignal().filter(fav => fav !== id);
    this.pokemonsFavorisSignal.set(favoris);
    this.sauvegarderPokemons(favoris);
  }

  retirerPaysFavori(code: string): void {
    if (!this.getUserId()) return;
    const favoris = this.paysFavorisSignal().filter(fav => fav !== code);
    this.paysFavorisSignal.set(favoris);
    this.sauvegarderPays(favoris);
  }

  effacerTousPokemonsFavoris(): void {
    if (!this.getUserId()) return;
    this.pokemonsFavorisSignal.set([]);
    this.sauvegarderPokemons([]);
  }

  effacerTousPaysFavoris(): void {
    if (!this.getUserId()) return;
    this.paysFavorisSignal.set([]);
    this.sauvegarderPays([]);
  }
}
