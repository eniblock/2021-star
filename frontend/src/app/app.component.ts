import { PATH_ROUTE } from './app-routing.module';
import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  PATH_ROUTE = PATH_ROUTE;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  logout() {
    this.router
      .navigate([PATH_ROUTE.HOME]) // On veut que l'utilisateur qui se reconnectera tombe sur la page d'accueil
      .finally(() => this.keycloakService.logout()); // Puis on se déconnecte
  }
}
