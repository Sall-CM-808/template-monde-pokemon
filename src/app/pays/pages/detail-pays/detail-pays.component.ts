import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaysService } from '../../services/pays.service';
import { MeteoService } from '../../services/meteo.service';
import { Pays } from '../../models/pays.model';
import { Meteo } from '../../models/meteo.model';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ErreurComponent } from '../../../shared/erreur/erreur.component';

// Page détail d'un pays
@Component({
  selector: 'app-detail-pays',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ErreurComponent],
  templateUrl: './detail-pays.component.html'
})
export class DetailPaysComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paysSvc = inject(PaysService);
  private meteoSvc = inject(MeteoService);

  // Données
  pays: Pays | null = null;
  meteo: Meteo | null = null;
  
  // États
  chargement = true;
  chargementMeteo = false;
  erreur = false;
  erreurMeteo = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code');

      if (!code) {
        this.chargement = false;
        this.erreur = true;
        return;
      }

      this.charger(code);
    });
  }

  // Charge les données du pays
  charger(code: string): void {
    const codeNettoye = code.trim().toUpperCase();

    this.chargement = true;
    this.erreur = false;

    this.paysSvc.getParCode(codeNettoye).subscribe({
      next: (data) => {
        this.pays = data;
        this.chargement = false;
        if (data) {
          this.chargerMeteo(data.latitude, data.longitude);
        } else {
          this.erreur = true;
        }
      },
      error: () => {
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Charge la météo du pays
  chargerMeteo(lat: number, lon: number): void {
    this.chargementMeteo = true;
    this.erreurMeteo = false;

    this.meteoSvc.getParCoords(lat, lon).subscribe({
      next: (data) => {
        this.meteo = data;
        this.chargementMeteo = false;
      },
      error: () => {
        this.erreurMeteo = true;
        this.chargementMeteo = false;
      }
    });
  }

  // Formatte un grand nombre
  formatNombre(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  // Retour à la liste
  retour(): void {
    window.history.back();
  }
}
