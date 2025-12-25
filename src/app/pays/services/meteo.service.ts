import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meteo, MeteoApiResponse } from '../models/meteo.model';

// Service pour récupérer les données météo
@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiMeteo;

  // Récupère la météo par coordonnées (latitude/longitude)
  getParCoords(lat: number, lon: number): Observable<Meteo | null> {
    const url = `${this.apiUrl}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    return this.http.get<MeteoApiResponse>(url).pipe(
      map(data => this.transformer(data)),
      catchError(err => {
        console.error('Erreur API météo:', err);
        return throwError(() => err);
      })
    );
  }

  // Transforme la réponse API en modèle Météo
  private transformer(data: MeteoApiResponse): Meteo {
    if (!data.current_weather) {
      throw new Error('Météo indisponible');
    }

    return {
      temperature: Math.round(data.current_weather.temperature),
      description: this.getLibelle(data.current_weather.weathercode),
      vent: Math.round(data.current_weather.windspeed),
      directionVent: data.current_weather.winddirection,
      code: data.current_weather.weathercode,
      heure: data.current_weather.time
    };
  }

  // Libellé météo (FR) à partir du weathercode Open-Meteo
  private getLibelle(code: number): string {
    const map: Record<number, string> = {
      0: 'Ciel dégagé',
      1: 'Principalement dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine',
      55: 'Bruine dense',
      56: 'Bruine verglaçante légère',
      57: 'Bruine verglaçante',
      61: 'Pluie faible',
      63: 'Pluie',
      65: 'Pluie forte',
      66: 'Pluie verglaçante légère',
      67: 'Pluie verglaçante',
      71: 'Neige faible',
      73: 'Neige',
      75: 'Neige forte',
      77: 'Grains de neige',
      80: 'Averses faibles',
      81: 'Averses',
      82: 'Fortes averses',
      85: 'Averses de neige faibles',
      86: 'Averses de neige fortes',
      95: 'Orage',
      96: 'Orage avec grêle',
      99: 'Orage violent'
    };

    return map[code] || `Code météo: ${code}`;
  }
}
