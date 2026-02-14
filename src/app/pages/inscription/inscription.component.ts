import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inscription.component.html'
})
export class InscriptionComponent {
  private authSvc = inject(AuthService);
  private router = inject(Router);

  nom = '';
  prenom = '';
  email = '';
  motDePasse = '';
  confirmation = '';

  erreur = '';
  succes = '';
  chargement = false;

  soumettre(): void {
    this.erreur = '';
    this.succes = '';
    this.chargement = true;

    const result = this.authSvc.inscription({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.motDePasse,
      confirmPassword: this.confirmation
    });

    this.chargement = false;

    if (result.success) {
      this.succes = result.message;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    } else {
      this.erreur = result.message;
    }
  }
}
