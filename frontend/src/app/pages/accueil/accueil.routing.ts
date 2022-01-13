import { AccueilComponent } from './accueil.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: AccueilComponent,
    pathMatch: 'full',
  },
];

export const AccueilRoutes = RouterModule.forChild(routes);
