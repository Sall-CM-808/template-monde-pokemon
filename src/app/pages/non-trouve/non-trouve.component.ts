import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Page 404 - Route non trouvée
@Component({
  selector: 'app-non-trouve',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './non-trouve.component.html'
})
export class NonTrouveComponent {}
