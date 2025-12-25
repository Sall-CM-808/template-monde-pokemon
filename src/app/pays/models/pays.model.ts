// Interface pour un pays
export interface Pays {
  nom: string;
  nomOfficiel: string;
  code: string;
  capitale: string[];
  region: string;
  sousRegion: string;
  population: number;
  superficie: number;
  drapeau: string;
  drapeauSvg: string;
  latitude: number;
  longitude: number;
  monnaies: Monnaie[];
  langues: string[];
  fuseauxHoraires: string[];
}

// Interface pour une monnaie
export interface Monnaie {
  code: string;
  nom: string;
  symbole: string;
}

// Interface pour la réponse API RestCountries
export interface PaysApiResponse {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  flags: {
    png: string;
    svg: string;
  };
  latlng: number[];
  currencies?: { [key: string]: { name: string; symbol: string } };
  languages?: { [key: string]: string };
  timezones?: string[];
}
