import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Interface pour les propriétés GeoJSON
interface GeoJsonProperties {
  name: string;
  iso_a2?: string;
  iso_a3?: string;
}

// Interface pour l'événement pays sélectionné
export interface PaysSelectionne {
  nom: string;
  code: string;
  coords: [number, number];
}

// Composant carte du monde interactive
@Component({
  selector: 'app-carte-monde',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      @if (chargement) {
        <div class="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      }
      <div id="map" class="w-full h-full"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class CarteMondeComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  @Output() paysSelectionne = new EventEmitter<PaysSelectionne>();

  private L: any = null;
  private map: any = null;
  private geoJsonLayer: any = null;
  chargement = true;

  private readonly GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initialiserCarte(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async initialiserCarte(): Promise<void> {
    // IMPORTANT: SSR => pas de window. On charge Leaflet via CDN seulement côté navigateur.
    const L = await this.chargerLeaflet();
    this.L = L;

    // Fixer les icônes Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Créer la carte
    this.map = L.map('map', {
      center: [30, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      worldCopyJump: true,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    });

    // Ajouter le fond de carte sombre style CheckPoint
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Charger les pays
    this.chargerPays();
  }

  private chargerPays(): void {
    this.http.get<any>(this.GEOJSON_URL).subscribe({
      next: (geojson) => {
        this.ajouterPays(geojson);
        this.chargement = false;
      },
      error: () => {
        // Fallback avec un autre GeoJSON
        this.http.get<any>('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').subscribe({
          next: (geojson) => {
            this.ajouterPays(geojson);
            this.chargement = false;
          },
          error: () => {
            this.chargement = false;
          }
        });
      }
    });
  }

  private ajouterPays(geojson: any): void {
    const L = this.L;
    if (!this.map) return;

    this.geoJsonLayer = L.geoJSON(geojson, {
      style: () => this.styleNormal(),
      onEachFeature: (feature: any, layer: any) => {
        const props = feature.properties;
        const nom = props.ADMIN || props.name || props.NAME || 'Inconnu';
        // RestCountries utilise principalement CCA3 (ex: FRA). On privilégie ISO_A3 / iso_a3.
        const code = props.ISO_A3 || props.iso_a3 || props.ISO_A2 || props.iso_a2 || '';

        // Tooltip au survol
        layer.bindTooltip(nom, {
          permanent: false,
          direction: 'top',
          className: 'pays-tooltip'
        });

        // Événements
        layer.on({
          mouseover: (e: any) => this.onMouseOver(e),
          mouseout: (e: any) => this.onMouseOut(e),
          click: () => this.onPaysClick(feature)
        });
      }
    }).addTo(this.map);
  }

  private styleNormal(): any {
    return {
      fillColor: '#60a5fa',
      weight: 1.5,
      opacity: 1,
      color: '#93c5fd',
      fillOpacity: 0.65
    };
  }

  private styleHover(): any {
    return {
      fillColor: '#fde047',
      weight: 2.5,
      opacity: 1,
      color: '#f59e0b',
      fillOpacity: 0.85
    };
  }

  private chargerLeaflet(): Promise<any> {
    // Déjà chargé
    const w = globalThis as any;
    if (w?.L) {
      return Promise.resolve(w.L);
    }

    return new Promise((resolve, reject) => {
      // Si un chargement est déjà en cours
      const existing = document.querySelector('script[data-leaflet="true"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve((globalThis as any).L));
        existing.addEventListener('error', () => reject());
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.defer = true;
      script.dataset['leaflet'] = 'true';
      script.onload = () => resolve((globalThis as any).L);
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private onMouseOver(e: any): void {
    const layer = e.target;
    layer.setStyle(this.styleHover());
    layer.bringToFront();
  }

  private onMouseOut(e: any): void {
    const layer = e.target;
    layer.setStyle(this.styleNormal());
  }

  private onPaysClick(feature: any): void {
    const L = this.L;
    const props = feature.properties;
    const nom = props.ADMIN || props.name || props.NAME || 'Inconnu';
    const codeBrut = props.ISO_A3 || props.iso_a3 || props.ISO_A2 || props.iso_a2 || '';
    const code = (codeBrut || '').toString().toUpperCase();

    // Calculer le centre du pays
    let coords: [number, number] = [0, 0];
    if (feature.geometry) {
      const bounds = L.geoJSON(feature).getBounds();
      const center = bounds.getCenter();
      coords = [center.lat, center.lng];
    }

    // Modal Angular (détails complets)
    this.paysSelectionne.emit({ nom, code, coords });
  }

  // Navigation vers la page détail
  allerVersDetail(code: string): void {
    if (code) {
      this.router.navigate(['/pays', code.toLowerCase()]);
    }
  }
}
