import { Routes, RouterModule } from '@angular/router';
import { ChargerComponent } from './charger.component';

const routes: Routes = [
  {
    path: '',
    component: ChargerComponent,
    pathMatch: 'full',
  },
];

export const ChargerRoutes = RouterModule.forChild(routes);
