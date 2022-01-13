import { Routes, RouterModule } from '@angular/router';
import { ReseauComponent } from './reseau.component';

const routes: Routes = [
  {
    path: '',
    component: ReseauComponent,
    pathMatch: 'full',
  },
];

export const ReseauRoutes = RouterModule.forChild(routes);
