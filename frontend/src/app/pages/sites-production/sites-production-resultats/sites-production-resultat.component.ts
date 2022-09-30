import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RechercheSitesProductionEntite} from 'src/app/models/RechercheSitesProduction';
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {
  FormAjoutTarifUnitaireComponent
} from "../../../components/formulaires/form-ajout-tarif-unitaire/form-ajout-tarif-unitaire.component";
import {FormulaireReserveBid} from "../../../models/ReserveBid";

@Component({
  selector: 'app-sites-production-resultat',
  templateUrl: './sites-production-resultat.component.html',
  styleUrls: ['./sites-production-resultat.component.css'],
})
export class SitesProductionResultatComponent implements OnInit {
  @Input() resultat?: RechercheSitesProductionEntite;
  @Output() resultatModified = new EventEmitter<FormulaireReserveBid>();

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
    const bottomSheetRef = this.bottomSheet.open(FormAjoutTarifUnitaireComponent, {
      data: {
        meteringPointMrid: this.resultat!.meteringPointMrid,
      }
    });
    bottomSheetRef.afterDismissed().subscribe((data) => {
      if (data) {
        this.resultatModified.emit(data)
      }
    });

  }

}
