import {Component, OnInit} from '@angular/core';
import {PATH_ROUTE} from 'src/app/app-routing.module';
import {InstanceService} from 'src/app/services/api/instance.service';
import {KeycloakService} from "../../../services/common/keycloak.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {getTypesDeRechercheSimple} from "../../../models/enum/TypeDeRechercheSimple.enum";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  PATH_ROUTE = PATH_ROUTE;
  InstanceEnum = Instance;

  participantName: string = "";
  username?: string;

  typeInstance?: Instance;

  constructor(
    private keycloakService: KeycloakService,
    private instanceService: InstanceService
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance()
      .subscribe((typeInstance) => this.typeInstance = typeInstance);
    this.instanceService.getParticipantName()
      .subscribe(participantName => this.participantName = participantName);
    this.keycloakService.getUserProfile()
      .subscribe(userProfile => this.username = userProfile != null ? userProfile.username : "");
  }

  deconnexion() {
    this.keycloakService.logout();
  }

}
