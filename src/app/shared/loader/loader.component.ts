import { Component, Input } from '@angular/core';

// Composant loader réutilisable
@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html'
})
export class LoaderComponent {
  // Message affiché pendant le chargement
  @Input() message = 'Chargement...';
}
