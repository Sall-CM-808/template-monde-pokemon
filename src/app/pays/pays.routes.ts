import { Routes } from '@angular/router';
import { ListePaysComponent } from './pages/liste-pays/liste-pays.component';
import { DetailPaysComponent } from './pages/detail-pays/detail-pays.component';

// Routes du module Pays
export const paysRoutes: Routes = [
  { path: '', component: ListePaysComponent },
  { path: ':code', component: DetailPaysComponent }
];
