import { Routes, RouterModule } from '@angular/router';
import { SitesProductionComponent } from './sites-production.component';

const routes: Routes = [
  {
    path: '',
    component: SitesProductionComponent,
    pathMatch: 'full',
  },
];

export const SitesProductionRoutes = RouterModule.forChild(routes);
