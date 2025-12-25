// Interface pour les données météo
export interface Meteo {
  temperature: number;
  description: string;
  vent: number;
  directionVent: number;
  code: number;
  heure: string;
}

// Interface pour la réponse API OpenWeatherMap
export interface MeteoApiResponse {
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
}
