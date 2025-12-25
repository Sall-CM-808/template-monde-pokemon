import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './connexion.component.html'
})
export class ConnexionComponent {
  email = '';
  motDePasse = '';

  soumettre(): void {
  }
}
