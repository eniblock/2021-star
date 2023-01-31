import {registerLocaleData} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import localeFr from '@angular/common/locales/fr';
import {KeycloakService} from "./services/common/keycloak.service";
import {tap} from "rxjs/operators";
import {SystemOperatorService} from "./services/api/system-operator.service";
import {InstanceService} from "./services/api/instance.service";
import {ProducerService} from "./services/api/producer.service";
import {SiteService} from "./services/api/site.service";
import {forkJoin} from "rxjs";
import {LoginService} from "./services/api/login.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  connecting: boolean = true;
  cacheLoading: boolean = true;
  authenticated: boolean = false;

  constructor(
    private loginService: LoginService,
    private keycloakService: KeycloakService,
    private systemOperatorService: SystemOperatorService,
    private instanceService: InstanceService,
    private producerService: ProducerService,
    private siteService: SiteService,
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
          this.loadCaches();
          this.countConnections();
        },
        error => console.error('Keycloak initialization error!', error)
      );
  }

  private loadCaches() {
    // Load caches
    forkJoin([
      this.systemOperatorService.getSystemOperators(),
      this.instanceService.getTypeInstance(),
      this.instanceService.getParticipantMrid(),
      this.instanceService.getParticipantName(),
      this.producerService.getProducerNames(),
      this.siteService.getSites()
    ]).subscribe(
      ok => {
        this.cacheLoading = false;
      });
  }

  private countConnections() {
    this.loginService.countConnections().subscribe();
  }
}
