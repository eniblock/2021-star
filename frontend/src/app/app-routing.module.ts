import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export enum PATH_ROUTE {
  ACCUEIL = 'accueil',
  RESEAU = 'reseau',
  ACTIVATIONS = 'activations',
  CHARGER = 'charger',

  ERROR = 'error',
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: PATH_ROUTE.ACCUEIL,
  },

  {
    path: PATH_ROUTE.ACCUEIL,
    loadChildren: () =>
      import('./pages/accueil/accueil.module').then((m) => m.HomeModule),
    data: { roles: [] },
  },

  {
    path: PATH_ROUTE.RESEAU,
    loadChildren: () =>
      import('./pages/reseau/reseau.module').then((m) => m.ReseauModule),
    data: { roles: [] },
  },

  {
    path: PATH_ROUTE.ACTIVATIONS,
    loadChildren: () =>
      import('./pages/activations/activations.module').then(
        (m) => m.ActivationsModule
      ),
    data: { roles: [] },
  },

  {
    path: PATH_ROUTE.CHARGER,
    loadChildren: () =>
      import('./pages/charger/charger.module').then((m) => m.ChargerModule),
    data: { roles: [] },
  },

  /* ******* ERROR ******* */
  {
    path: PATH_ROUTE.ERROR,
    loadChildren: () =>
      import('./pages/error/error.module').then((m) => m.ErrorModule),
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
