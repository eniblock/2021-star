import {AccessDeniedComponent} from "./access-denied/access-denied.component";
import {AuthGuard} from "./services/auth.guard";
import {AdminComponent} from "./admin/admin.component";
import {ManagerComponent} from "./manager/manager.component";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";

const routes: Routes = [
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: {roles: ['ROLE_ADMIN']},
  },
  {
    path: 'manager',
    component: ManagerComponent,
    canActivate: [AuthGuard],
    data: {roles: ['ROLE_MANAGER']},
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
