import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaysService } from '../../pays/services/pays.service';
import { MeteoService } from '../../pays/services/meteo.service';
import { Pays } from '../../pays/models/pays.model';
import { Meteo } from '../../pays/models/meteo.model';
import { of, switchMap } from 'rxjs';

// Interface pour les données reçues
export interface DonneesPaysModal {
  nom: string;
  code: string;
  coords: [number, number];
}

// Modal affichant les détails d'un pays
@Component({
  selector: 'app-modal-pays',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (visible) {
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[5000] flex items-center justify-center p-2 sm:p-4"
           (click)="fermer()">
        
        <!-- Modal -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all border border-gray-200 dark:border-gray-700"
             (click)="$event.stopPropagation()">
          
          <!-- Header avec drapeau -->
          @if (pays) {
            <div class="relative h-24 sm:h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <img [src]="pays.drapeau" 
                   [alt]="pays.nom"
                   class="h-16 sm:h-20 shadow-lg rounded">
              
              <!-- Bouton fermer -->
              <button (click)="fermer()" 
                      class="absolute top-3 right-3 text-white/80 hover:text-white transition">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Contenu -->
            <div class="p-4 sm:p-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ pays.nom }}</h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">{{ pays.region }}</p>

              <!-- Infos principales -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <span class="text-xs text-gray-400 uppercase">Capitale</span>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ pays.capitale || 'N/A' }}</p>
                </div>
                <div>
                  <span class="text-xs text-gray-400 uppercase">Population</span>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ pays.population | number }}</p>
                </div>
              </div>

              <!-- Météo -->
              @if (meteo) {
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-4 mb-4 border border-transparent dark:border-gray-700">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span class="text-xs text-gray-400 uppercase">Météo actuelle</span>
                      <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ meteo.temperature }}°C</p>
                      <p class="text-sm text-gray-600 dark:text-gray-300">{{ meteo.description }}</p>
                    </div>
                    <div class="text-left sm:text-right text-sm text-gray-500">
                      <p>Vent: {{ meteo.vent }} km/h</p>
                    </div>
                  </div>
                </div>
              } @else if (chargementMeteo) {
                <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4 text-center border border-gray-200 dark:border-gray-700">
                  <div class="animate-pulse text-gray-500 dark:text-gray-300">Chargement météo...</div>
                </div>
              }

              <!-- Bouton voir plus -->
              <a [routerLink]="['/pays', (pays.code || donnees?.code)]"
                 class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition">
                Voir les détails complets
              </a>
            </div>
          } @else if (chargement) {
            <!-- Loading state -->
            <div class="p-8 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-300">Chargement...</p>
            </div>
          } @else if (erreur) {
            <!-- Error state -->
            <div class="p-8 text-center">
              <p class="text-red-500 mb-4">Impossible de charger les informations</p>
              <button (click)="fermer()" 
                      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Fermer
              </button>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ModalPaysComponent implements OnChanges {
  private paysSvc = inject(PaysService);
  private meteoSvc = inject(MeteoService);

  @Input() donnees: DonneesPaysModal | null = null;
  @Input() visible = false;
  @Output() fermerModal = new EventEmitter<void>();

  pays: Pays | null = null;
  meteo: Meteo | null = null;
  chargement = false;
  chargementMeteo = false;
  erreur = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['donnees'] && this.donnees && this.visible) {
      this.chargerDonnees();
    }
  }

  private chargerDonnees(): void {
    this.chargement = true;
    this.erreur = false;
    this.pays = null;
    this.meteo = null;

    const code = (this.donnees?.code || '').trim();
    const nom = (this.donnees?.nom || '').trim();

    const source$ = (code ? this.paysSvc.getParCode(code) : of(null)).pipe(
      switchMap((pays) => {
        // Si le code fonctionne, on garde
        if (pays) return of(pays);

        // Fallback: certains GeoJSON ont des codes non compatibles RestCountries
        if (!nom) return of(null);
        return this.paysSvc.chercher(nom).pipe(
          switchMap((liste) => {
            if (!liste?.length) return of(null);

            // Essayer de matcher par nom exact (insensible à la casse)
            const lower = nom.toLowerCase();
            const exact = liste.find(p => p.nom.toLowerCase() === lower);
            return of(exact || liste[0]);
          })
        );
      })
    );

    source$.subscribe({
      next: (pays) => {
        this.pays = pays;
        this.chargement = false;

        if (!pays) {
          this.erreur = true;
          return;
        }

        // Charger la météo
        if (pays.latitude && pays.longitude) {
          this.chargerMeteo(pays.latitude, pays.longitude);
        }
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
      }
    });
  }

  private chargerMeteo(lat: number, lng: number): void {
    this.chargementMeteo = true;
    
    this.meteoSvc.getParCoords(lat, lng).subscribe({
      next: (meteo) => {
        this.meteo = meteo;
        this.chargementMeteo = false;
      },
      error: () => {
        this.chargementMeteo = false;
      }
    });
  }

  fermer(): void {
    this.fermerModal.emit();
  }
}
