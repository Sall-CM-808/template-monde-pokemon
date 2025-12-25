import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaysService } from '../../services/pays.service';
import { Pays } from '../../models/pays.model';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ErreurComponent } from '../../../shared/erreur/erreur.component';

// Page liste des pays
@Component({
  selector: 'app-liste-pays',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent, ErreurComponent],
  templateUrl: './liste-pays.component.html'
})
export class ListePaysComponent implements OnInit {
  private paysSvc = inject(PaysService);

  // Données
  pays: Pays[] = [];
  paysFiltres: Pays[] = [];
  
  // États
  chargement = true;
  erreur = false;
  
  // Recherche et filtres
  recherche = '';
  regionFiltre = '';
  regions: string[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  
  // Pagination
  page = 1;
  parPage = 20;
  
  ngOnInit(): void {
    this.charger();
  }

  // Charge tous les pays
  charger(): void {
    this.chargement = true;
    this.erreur = false;
    
    this.paysSvc.getTous().subscribe({
      next: (data) => {
        this.pays = data.sort((a, b) => a.nom.localeCompare(b.nom));
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Filtre les pays selon recherche et région
  filtrer(): void {
    let resultat = [...this.pays];
    
    // Filtre par région
    if (this.regionFiltre) {
      resultat = resultat.filter(p => p.region === this.regionFiltre);
    }
    
    // Filtre par recherche
    if (this.recherche.trim()) {
      const terme = this.recherche.toLowerCase().trim();
      resultat = resultat.filter(p => 
        p.nom.toLowerCase().includes(terme) ||
        p.capitale.some(c => c.toLowerCase().includes(terme))
      );
    }
    
    this.paysFiltres = resultat;
    this.page = 1;
  }

  // Retourne les pays de la page courante
  get paysPagines(): Pays[] {
    const debut = (this.page - 1) * this.parPage;
    return this.paysFiltres.slice(debut, debut + this.parPage);
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.paysFiltres.length / this.parPage);
  }

  // Change de page
  allerPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Réinitialise les filtres
  reinitialiser(): void {
    this.recherche = '';
    this.regionFiltre = '';
    this.filtrer();
  }

  // Formatte la population
  formatPop(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Mrd';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + ' K';
    return n.toString();
  }
}
