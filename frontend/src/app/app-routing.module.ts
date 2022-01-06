import { AuthGuard } from './services/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export enum PATH_ROUTE {
  HOME = 'home',

  ERROR = 'error',
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: PATH_ROUTE.HOME,
  },

  {
    path: PATH_ROUTE.HOME,
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },

  /* ******* ERROR ******* */
  {
    path: PATH_ROUTE.ERROR,
    loadChildren: () =>
      import('./pages/error/error.module').then((m) => m.ErrorModule),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },
  {
    path: '**',
    redirectTo: PATH_ROUTE.ERROR,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
