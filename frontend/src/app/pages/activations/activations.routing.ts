import { Routes, RouterModule } from '@angular/router';
import { ActivationsComponent } from './activations.component';

const routes: Routes = [
  {
    path: '',
    component: ActivationsComponent,
    pathMatch: 'full',
  },
];

export const ActivationsRoutes = RouterModule.forChild(routes);
