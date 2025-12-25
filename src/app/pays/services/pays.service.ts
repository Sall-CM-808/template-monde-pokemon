import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pays, PaysApiResponse, Monnaie } from '../models/pays.model';

// Service pour récupérer les données des pays
@Injectable({
  providedIn: 'root'
})
export class PaysService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiPays;

  // Champs utilisés pour optimiser les réponses (REST Countries)
  private champsListe = 'name,flags,region,population,capital,area,latlng,cca3';
  // Limite officielle: 10 champs max
  private champsDetail = 'name,flags,region,population,capital,area,latlng,cca3,currencies,languages';

  // Récupère tous les pays
  getTous(): Observable<Pays[]> {
    const url = `${this.apiUrl}/all?fields=${this.champsListe}`;

    return this.http.get<PaysApiResponse[]>(url).pipe(
      map(data => data.map(p => this.transformer(p))),
      catchError(err => {
        console.error('Erreur API pays:', err);
        return throwError(() => err);
      })
    );
  }

  // Récupère un pays par son code
  getParCode(code: string): Observable<Pays | null> {
    // Sur /alpha/{code}, on récupère la réponse complète (évite la limite de 10 champs sur fields)
    const url = `${this.apiUrl}/alpha/${code}`;

    return this.http.get<PaysApiResponse | PaysApiResponse[]>(url).pipe(
      map(data => {
        const p = Array.isArray(data) ? data[0] : data;
        return p ? this.transformer(p) : null;
      }),
      catchError(err => {
        console.error('Erreur API pays:', err);
        return throwError(() => err);
      })
    );
  }

  // Recherche des pays par nom
  chercher(nom: string): Observable<Pays[]> {
    const url = `${this.apiUrl}/name/${nom}?fields=${this.champsListe}`;

    return this.http.get<PaysApiResponse[]>(url).pipe(
      map(data => data.map(p => this.transformer(p))),
      catchError(() => throwError(() => new Error('Erreur API pays (recherche)')))
    );
  }

  // Récupère les pays par région/continent
  getParRegion(region: string): Observable<Pays[]> {
    const url = `${this.apiUrl}/region/${region}?fields=${this.champsListe}`;

    return this.http.get<PaysApiResponse[]>(url).pipe(
      map(data => data.map(p => this.transformer(p))),
      catchError(() => throwError(() => new Error('Erreur API pays (region)')))
    );
  }

  // Transforme la réponse API en modèle Pays
  private transformer(p: PaysApiResponse): Pays {
    const monnaies: Monnaie[] = [];
    if (p.currencies) {
      Object.entries(p.currencies).forEach(([code, val]) => {
        monnaies.push({ code, nom: val.name, symbole: val.symbol || '' });
      });
    }

    const langues: string[] = p.languages ? Object.values(p.languages) : [];

    return {
      nom: p.name.common,
      nomOfficiel: p.name.official,
      code: p.cca3,
      capitale: p.capital || [],
      region: p.region,
      sousRegion: p.subregion || '',
      population: p.population,
      superficie: p.area,
      drapeau: p.flags.png,
      drapeauSvg: p.flags.svg,
      latitude: p.latlng?.[0] || 0,
      longitude: p.latlng?.[1] || 0,
      monnaies,
      langues,
      fuseauxHoraires: p.timezones || []
    };
  }
}
