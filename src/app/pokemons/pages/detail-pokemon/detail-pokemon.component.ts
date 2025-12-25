import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../models/pokemon.model';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ErreurComponent } from '../../../shared/erreur/erreur.component';

// Page détail d'un pokémon
@Component({
  selector: 'app-detail-pokemon',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ErreurComponent],
  templateUrl: './detail-pokemon.component.html'
})
export class DetailPokemonComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonSvc = inject(PokemonService);

  // Données
  pokemon: Pokemon | null = null;
  
  // États
  chargement = true;
  erreur = false;
  imageShiny = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.charger(+id);
    }
  }

  // Charge les données du pokémon
  charger(id: number): void {
    this.chargement = true;
    this.erreur = false;

    this.pokemonSvc.getParId(id).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Bascule image normale/shiny
  toggleShiny(): void {
    this.imageShiny = !this.imageShiny;
  }

  // Image à afficher
  get imageAffichee(): string {
    if (!this.pokemon) return '';
    return this.imageShiny ? this.pokemon.imageShiny : this.pokemon.image;
  }

  // Formate l'ID avec zéros
  formatId(id: number): string {
    return '#' + id.toString().padStart(3, '0');
  }

  // Couleur du type
  couleurType(type: string): string {
    const couleurs: Record<string, string> = {
      'Normal': 'bg-gray-400',
      'Feu': 'bg-red-500',
      'Eau': 'bg-blue-500',
      'Électrik': 'bg-yellow-400',
      'Plante': 'bg-green-500',
      'Glace': 'bg-cyan-400',
      'Combat': 'bg-orange-700',
      'Poison': 'bg-purple-500',
      'Sol': 'bg-amber-600',
      'Vol': 'bg-indigo-400',
      'Psy': 'bg-pink-500',
      'Insecte': 'bg-lime-500',
      'Roche': 'bg-stone-500',
      'Spectre': 'bg-violet-700',
      'Dragon': 'bg-indigo-700',
      'Ténèbres': 'bg-gray-800',
      'Acier': 'bg-slate-400',
      'Fée': 'bg-pink-300'
    };
    return couleurs[type] || 'bg-gray-400';
  }

  // Couleur de la barre de stat
  couleurStat(valeur: number): string {
    if (valeur >= 100) return 'bg-green-500';
    if (valeur >= 70) return 'bg-yellow-500';
    if (valeur >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Retour à la liste
  retour(): void {
    window.history.back();
  }

  // Total des stats
  get totalStats(): number {
    if (!this.pokemon) return 0;
    return this.pokemon.stats.reduce((acc, s) => acc + s.valeur, 0);
  }
}
