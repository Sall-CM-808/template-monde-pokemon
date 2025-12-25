import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  @Output() paysSelectionne = new EventEmitter<PaysSelectionne>();

  private L: any = null;
  private map: any = null;
  private geoJsonLayer: any = null;
  private intersectionObserver: IntersectionObserver | null = null;
  chargement = true;

  private readonly GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
  private readonly GEOJSON_CACHE_KEY = 'geojson:countries:v1';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initialiserQuandVisible();
    }
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initialiserQuandVisible(): void {
    // Init seulement quand le composant est réellement visible (perf + LCP)
    const host = document.querySelector('app-carte-monde');
    if (!host || !('IntersectionObserver' in window)) {
      setTimeout(() => this.initialiserCarte(), 0);
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.intersectionObserver?.disconnect();
          this.intersectionObserver = null;
          setTimeout(() => this.initialiserCarte(), 0);
        }
      },
      { root: null, threshold: 0.1 },
    );

    this.intersectionObserver.observe(host);
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
      preferCanvas: true,
      worldCopyJump: true,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    });

    // Ajouter le fond de carte (léger) selon le thème
    const isDark = document.documentElement.classList.contains('dark');
    const tilesUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tilesUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 2,
      maxZoom: 6,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    }).addTo(this.map);

    // Charger les pays
    this.chargerPays();
  }

  private chargerPays(): void {
    void this.chargerPaysOptimise();
  }

  private async chargerPaysOptimise(): Promise<void> {
    try {
      const geojson = await this.getGeoJsonAvecCache(this.GEOJSON_URL, this.GEOJSON_CACHE_KEY);
      this.ajouterPays(geojson);
      this.chargement = false;
      return;
    } catch {
      // Fallback avec un autre GeoJSON
      try {
        const geojson = await this.getGeoJsonAvecCache(
          'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
          'geojson:countries:fallback:v1',
        );
        this.ajouterPays(geojson);
      } finally {
        this.chargement = false;
      }
    }
  }

  private async getGeoJsonAvecCache(url: string, cacheKey: string): Promise<any> {
    // 1) Cache API (rapide en prod, évite re-download)
    if ('caches' in window) {
      const cache = await caches.open('app-cache-v1');
      const req = new Request(url, { cache: 'force-cache' });
      const cached = await cache.match(req);
      if (cached) return cached.json();

      const res = await fetch(req);
      if (!res.ok) throw new Error('GeoJSON fetch failed');
      // Clone pour la mise en cache
      await cache.put(req, res.clone());
      return res.json();
    }

    // 2) Fallback sans Cache API
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    const geojson = await fetch(url).then((r) => {
      if (!r.ok) throw new Error('GeoJSON fetch failed');
      return r.json();
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify(geojson));
    } catch {
      // Le GeoJSON peut être trop gros pour localStorage selon le navigateur
    }

    return geojson;
  }

  private ajouterPays(geojson: any): void {
    const L = this.L;
    if (!this.map) return;

    const renderer = L.canvas({ padding: 0.5 });

    this.geoJsonLayer = L.geoJSON(geojson, {
      renderer,
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
