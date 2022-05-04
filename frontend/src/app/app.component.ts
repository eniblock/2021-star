import {registerLocaleData} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import {KeycloakService} from "./services/common/keycloak.service";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  connecting: boolean = true;
  authenticated: boolean = false;

  constructor(
    private keycloakService: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');

    // Init Keycloak
    this.keycloakService.init()
      .pipe(
        tap(authenticated => this.connecting = false)
      )
      .subscribe(
        authenticated => {
          this.authenticated = authenticated;
        },
        error => console.error('Keycloak initialization error!', error)
      );

  }
}
