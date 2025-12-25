import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Composant de navigation principale
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  // Menu ouvert/fermé (mobile)
  menuOuvert = false;

  // Thème sombre activé ?
  themeSombre = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('theme');
    // Par défaut: sombre (cohérent avec le design actuel)
    this.themeSombre = saved ? saved === 'dark' : false;
    this.appliquerTheme();
  }

  // Bascule le menu mobile
  basculerMenu(): void {
    this.menuOuvert = !this.menuOuvert;
  }

  // Ferme le menu mobile
  fermerMenu(): void {
    this.menuOuvert = false;
  }

  // Bascule le thème clair/sombre
  basculerTheme(): void {
    this.themeSombre = !this.themeSombre;
    this.appliquerTheme();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.themeSombre ? 'dark' : 'light');
    }
  }

  private appliquerTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    if (this.themeSombre) root.classList.add('dark');
    else root.classList.remove('dark');
  }
}
