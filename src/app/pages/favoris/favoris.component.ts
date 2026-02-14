import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavorisService } from '../../shared/services/favoris.service';
import { PokemonService } from '../../pokemons/services/pokemon.service';
import { PaysService } from '../../pays/services/pays.service';
import { PokemonResume } from '../../pokemons/models/pokemon.model';
import { Pays } from '../../pays/models/pays.model';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './favoris.component.html'
})
export class FavorisComponent implements OnInit {
  favorisSvc = inject(FavorisService);
  private pokemonSvc = inject(PokemonService);
  private paysSvc = inject(PaysService);

  pokemonsFavoris: PokemonResume[] = [];
  paysFavoris: Pays[] = [];
  chargement = true;

  constructor() {
    effect(() => {
      this.favorisSvc.pokemonsFavoris();
      this.favorisSvc.paysFavoris();
      this.chargerFavoris();
    });
  }

  ngOnInit(): void {
  }

  chargerFavoris(): void {
    this.chargement = true;

    const idsPokemon = this.favorisSvc.pokemonsFavoris();
    const codesPays = this.favorisSvc.paysFavoris();

    const observables = {
      pokemons: idsPokemon.length > 0 
        ? this.pokemonSvc.getListe().pipe(
            catchError(() => of([]))
          )
        : of([]),
      pays: codesPays.length > 0
        ? this.paysSvc.getTous().pipe(
            catchError(() => of([]))
          )
        : of([])
    };

    forkJoin(observables).subscribe({
      next: ({ pokemons, pays }) => {
        this.pokemonsFavoris = pokemons.filter(p => idsPokemon.includes(p.id));
        this.paysFavoris = pays.filter(p => codesPays.includes(p.code));
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  retirerPokemon(id: number): void {
    this.favorisSvc.retirerPokemonFavori(id);
    this.pokemonsFavoris = this.pokemonsFavoris.filter(p => p.id !== id);
  }

  retirerPays(code: string): void {
    this.favorisSvc.retirerPaysFavori(code);
    this.paysFavoris = this.paysFavoris.filter(p => p.code !== code);
  }

  formatId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  formatPop(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Mrd';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + ' K';
    return n.toString();
  }

  get totalFavoris(): number {
    return this.favorisSvc.nombrePokemonsFavoris() + this.favorisSvc.nombrePaysFavoris();
  }
}
