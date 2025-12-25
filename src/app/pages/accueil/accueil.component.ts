import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarteMondeComponent, PaysSelectionne } from '../../shared/carte-monde/carte-monde.component';
import { ModalPaysComponent, DonneesPaysModal } from '../../shared/modal-pays/modal-pays.component';

// Page d'accueil de l'application
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [RouterLink, CarteMondeComponent, ModalPaysComponent],
  templateUrl: './accueil.component.html'
})
export class AccueilComponent {
  // Modal pays
  modalVisible = false;
  paysModal: DonneesPaysModal | null = null;

  // Gère la sélection d'un pays sur la carte
  onPaysSelectionne(pays: PaysSelectionne): void {
    this.paysModal = {
      nom: pays.nom,
      code: pays.code,
      coords: pays.coords
    };
    this.modalVisible = true;
  }

  // Ferme le modal
  fermerModal(): void {
    this.modalVisible = false;
    this.paysModal = null;
  }
}
