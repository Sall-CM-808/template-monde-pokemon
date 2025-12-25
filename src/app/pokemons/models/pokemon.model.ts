// Interface pour un pokémon (liste)
export interface PokemonResume {
  id: number;
  nom: string;
  image: string;
  url: string;
}

// Interface pour un pokémon (détail complet)
export interface Pokemon {
  id: number;
  nom: string;
  image: string;
  imageShiny: string;
  taille: number;
  poids: number;
  types: string[];
  capacites: string[];
  stats: PokemonStat[];
}

// Interface pour une statistique
export interface PokemonStat {
  nom: string;
  valeur: number;
}

// Interface pour la réponse API liste
export interface PokemonListeApiResponse {
  count: number;
  results: {
    name: string;
    url: string;
  }[];
}

// Interface pour la réponse API détail
export interface PokemonDetailApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}
