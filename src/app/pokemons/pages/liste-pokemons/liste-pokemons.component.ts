import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonResume } from '../../models/pokemon.model';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ErreurComponent } from '../../../shared/erreur/erreur.component';

// Page liste des pokémons
@Component({
  selector: 'app-liste-pokemons',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent, ErreurComponent],
  templateUrl: './liste-pokemons.component.html'
})
export class ListePokemonsComponent implements OnInit {
  private pokemonSvc = inject(PokemonService);

  // Données
  pokemons: PokemonResume[] = [];
  pokemonsFiltres: PokemonResume[] = [];
  
  // États
  chargement = true;
  erreur = false;
  
  // Recherche
  recherche = '';
  
  // Pagination
  page = 1;
  parPage = 20;
  
  ngOnInit(): void {
    this.charger();
  }

  // Charge tous les pokémons
  charger(): void {
    this.chargement = true;
    this.erreur = false;
    
    this.pokemonSvc.getListe().subscribe({
      next: (data) => {
        this.pokemons = data;
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Filtre les pokémons selon la recherche
  filtrer(): void {
    let resultat = [...this.pokemons];
    
    if (this.recherche.trim()) {
      const terme = this.recherche.toLowerCase().trim();
      resultat = resultat.filter(p => 
        p.nom.toLowerCase().includes(terme) ||
        p.id.toString() === terme
      );
    }
    
    this.pokemonsFiltres = resultat;
    this.page = 1;
  }

  // Retourne les pokémons de la page courante
  get pokemonsPagines(): PokemonResume[] {
    const debut = (this.page - 1) * this.parPage;
    return this.pokemonsFiltres.slice(debut, debut + this.parPage);
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.pokemonsFiltres.length / this.parPage);
  }

  // Change de page
  allerPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Réinitialise la recherche
  reinitialiser(): void {
    this.recherche = '';
    this.filtrer();
  }

  // Formate l'ID avec zéros (ex: #001)
  formatId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }
}
