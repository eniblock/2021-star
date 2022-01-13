import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { PATH_ROUTE } from 'src/app/app-routing.module';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit() {}

  deconnexion() {
    this.keycloakService.logout('/');
  }
}
