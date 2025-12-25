import { Component, Input, Output, EventEmitter } from '@angular/core';

// Composant erreur réutilisable
@Component({
  selector: 'app-erreur',
  standalone: true,
  templateUrl: './erreur.component.html'
})
export class ErreurComponent {
  // Message d'erreur
  @Input() message = 'Une erreur est survenue';
  
  // Afficher bouton réessayer
  @Input() afficherRetry = true;

  // Événement réessayer
  @Output() retry = new EventEmitter<void>();

  // Déclenche le retry
  reessayer(): void {
    this.retry.emit();
  }
}
