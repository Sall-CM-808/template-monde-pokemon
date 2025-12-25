import { Component } from '@angular/core';

// Composant pied de page
@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  // Année courante pour le copyright
  annee = new Date().getFullYear();
}
