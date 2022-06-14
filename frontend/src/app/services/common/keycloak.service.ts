import {Injectable} from '@angular/core';
import Keycloak, {KeycloakConfig, KeycloakProfile} from "keycloak-js";
import {environment} from "../../../environments/environment";
import {from, Observable, of} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  keycloak: Keycloak;

  constructor() {
    const config: KeycloakConfig = {
      url: environment.keycloak.issuer
        || window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/auth/',
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    };
    this.keycloak = new Keycloak(config);
  }

  init(): Observable<boolean> {
    return from(this.keycloak.init({onLoad: 'login-required'}));
  }

  logout(): Observable<void> {
    return from(this.keycloak.logout());
  }

  getToken(fresh: boolean): Observable<string | null> {
    if (fresh) {
      return from(this.keycloak.updateToken(10))
        .pipe(
          map(hasBeenRefreshed => this.keycloak.token || null)
        )
    } else {
      return of(this.keycloak.token || null);
    }
  }

  getUserProfile(): Observable<KeycloakProfile | void> {
    return from(this.keycloak.loadUserProfile());
  }

}
