export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  dateInscription: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface StoredUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  passwordHash: string;
  dateInscription: string;
}

export interface Session {
  userId: string;
  email: string;
  nom: string;
  prenom: string;
  dateConnexion: string;
}
