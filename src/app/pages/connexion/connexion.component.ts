import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './connexion.component.html'
})
export class ConnexionComponent implements OnInit {
  private authSvc = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private returnUrl = '/';

  email = '';
  motDePasse = '';

  erreur = '';
  succes = '';
  chargement = false;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  soumettre(): void {
    this.erreur = '';
    this.succes = '';
    this.chargement = true;

    const result = this.authSvc.connexion({
      email: this.email,
      password: this.motDePasse
    });

    this.chargement = false;

    if (result.success) {
      this.succes = result.message;
      setTimeout(() => {
        this.router.navigateByUrl(this.returnUrl);
      }, 1000);
    } else {
      this.erreur = result.message;
    }
  }
}
