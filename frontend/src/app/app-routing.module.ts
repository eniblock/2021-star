import { AuthGuard } from './services/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export enum PATH_ROUTE {
  HOME = '',

  ERROR = 'error',
}

const routes: Routes = [
  {
    path: PATH_ROUTE.HOME,
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
    data: { roles: [] },
  },

  // TODO : errors !!!
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
