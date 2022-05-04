import { Component, OnInit } from '@angular/core';
import { PATH_ROUTE } from 'src/app/app-routing.module';
import { toTypeOrganisationFr } from 'src/app/models/enum/Instance.enum';
import { InstanceService } from 'src/app/services/api/instance.service';
import {KeycloakService} from "../../../services/common/keycloak.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;

  typeOrganisation?: string;

  constructor(
    private keycloakService: KeycloakService,
    private instanceService: InstanceService
  ) {}

  ngOnInit() {
    this.instanceService
      .getTypeInstance()
      .subscribe(
        (instance) => (this.typeOrganisation = toTypeOrganisationFr(instance))
      );
  }

  deconnexion() {
    this.keycloakService.logout();
  }
}
