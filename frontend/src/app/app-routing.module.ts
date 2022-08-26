import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export enum PATH_ROUTE {
  ACCUEIL = 'accueil',
  SITES_PRODUCTION = 'sitesProduction',
  LIMITATIONS = 'limitations',
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
    path: PATH_ROUTE.SITES_PRODUCTION,
    loadChildren: () =>
      import('./pages/sites-production/sites-production.module').then((m) => m.SitesProductionModule),
    data: { roles: [] },
  },

  {
    path: PATH_ROUTE.LIMITATIONS,
    loadChildren: () =>
      import('./pages/activations/limitations.module').then(
        (m) => m.LimitationsModule
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
