import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorComponent,
    pathMatch: 'full',
  },
];

export const ErrorRoutes = RouterModule.forChild(routes);
