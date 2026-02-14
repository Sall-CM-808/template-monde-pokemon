import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserCredentials, UserRegistration, StoredUser, Session } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CLE_USERS = 'users';
  private readonly CLE_SESSION = 'session';

  private sessionSignal = signal<Session | null>(this.chargerSession());
  
  session = this.sessionSignal.asReadonly();
  estConnecte = computed(() => this.sessionSignal() !== null);
  utilisateurActuel = computed(() => {
    const sess = this.sessionSignal();
    if (!sess) return null;
    return {
      id: sess.userId,
      nom: sess.nom,
      prenom: sess.prenom,
      email: sess.email,
      dateInscription: ''
    } as User;
  });

  constructor(private router: Router) {}

  private chargerSession(): Session | null {
    try {
      const data = localStorage.getItem(this.CLE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private sauvegarderSession(session: Session): void {
    try {
      localStorage.setItem(this.CLE_SESSION, JSON.stringify(session));
      this.sessionSignal.set(session);
    } catch (err) {
      console.error('Erreur sauvegarde session:', err);
    }
  }

  private supprimerSession(): void {
    try {
      localStorage.removeItem(this.CLE_SESSION);
      this.sessionSignal.set(null);
    } catch (err) {
      console.error('Erreur suppression session:', err);
    }
  }

  private chargerUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(this.CLE_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private sauvegarderUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(this.CLE_USERS, JSON.stringify(users));
    } catch (err) {
      console.error('Erreur sauvegarde utilisateurs:', err);
    }
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private genererIdUnique(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  inscription(data: UserRegistration): { success: boolean; message: string } {
    if (!data.nom || !data.prenom || !data.email || !data.password) {
      return { success: false, message: 'Tous les champs sont obligatoires' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, message: 'Les mots de passe ne correspondent pas' };
    }

    if (data.password.length < 6) {
      return { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: 'Email invalide' };
    }

    const users = this.chargerUsers();
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Cet email est déjà utilisé' };
    }

    const newUser: StoredUser = {
      id: this.genererIdUnique(),
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      passwordHash: this.hashPassword(data.password),
      dateInscription: new Date().toISOString()
    };

    users.push(newUser);
    this.sauvegarderUsers(users);

    const session: Session = {
      userId: newUser.id,
      email: newUser.email,
      nom: newUser.nom,
      prenom: newUser.prenom,
      dateConnexion: new Date().toISOString()
    };
    this.sauvegarderSession(session);

    return { success: true, message: 'Inscription réussie' };
  }

  connexion(credentials: UserCredentials): { success: boolean; message: string } {
    if (!credentials.email || !credentials.password) {
      return { success: false, message: 'Email et mot de passe requis' };
    }

    const users = this.chargerUsers();
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect' };
    }

    const passwordHash = this.hashPassword(credentials.password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, message: 'Email ou mot de passe incorrect' };
    }

    const session: Session = {
      userId: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      dateConnexion: new Date().toISOString()
    };
    this.sauvegarderSession(session);

    return { success: true, message: 'Connexion réussie' };
  }

  deconnexion(): void {
    this.supprimerSession();
    this.router.navigate(['/']);
  }

  obtenirUtilisateurs(): User[] {
    const users = this.chargerUsers();
    return users.map(u => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      dateInscription: u.dateInscription
    }));
  }
}
