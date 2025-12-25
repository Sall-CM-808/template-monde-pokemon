import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inscription.component.html'
})
export class InscriptionComponent {
  nom = '';
  email = '';
  motDePasse = '';
  confirmation = '';

  soumettre(): void {
  }
}
