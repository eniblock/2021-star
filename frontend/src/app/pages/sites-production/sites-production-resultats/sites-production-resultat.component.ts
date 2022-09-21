import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {Component, Input, OnInit} from '@angular/core';
import {RechercheSitesProductionEntite} from 'src/app/models/RechercheSitesProduction';
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {LimitationsGraphComponent} from "../../limitations/limitations-graph/limitations-graph.component";
import {
  SitesProductionAjoutTarifUnitaireComponent
} from "../sites-production-ajout-tarif-unitaire/sites-production-ajout-tarif-unitaire.component";

@Component({
  selector: 'app-sites-production-resultat',
  templateUrl: './sites-production-resultat.component.html',
  styleUrls: ['./sites-production-resultat.component.css'],
})
export class SitesProductionResultatComponent implements OnInit {
  @Input() resultat?: RechercheSitesProductionEntite;

  InstanceEnum = Instance;

  TypeSiteEnum = TypeSite;
  typeInstance?: Instance;

  showDetails = false;

  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.typeInstance = typeInstance;
    });
  }

  open() {
    this.showDetails = true;
  }

  close() {
    this.showDetails = false;
  }

  ajoutTarif() {
    this.bottomSheet.open(SitesProductionAjoutTarifUnitaireComponent, {
      data: {
        meteringPointMrid: this.resultat!.meteringPointMrid,
      }
    });
  }

}
