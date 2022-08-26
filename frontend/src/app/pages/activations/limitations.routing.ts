import { Routes, RouterModule } from '@angular/router';
import { LimitationsComponent } from './limitations.component';

const routes: Routes = [
  {
    path: '',
    component: LimitationsComponent,
    pathMatch: 'full',
  },
];

export const LimitationsRoutes = RouterModule.forChild(routes);
