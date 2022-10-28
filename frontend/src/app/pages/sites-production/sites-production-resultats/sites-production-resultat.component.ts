import {TypeSite} from 'src/app/models/enum/TypeSite.enum';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RechercheSitesProductionEntite} from 'src/app/models/RechercheSitesProduction';
import {InstanceService} from "../../../services/api/instance.service";
import {Instance} from "../../../models/enum/Instance.enum";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {
  FormAjoutTarifUnitaireComponent
} from "../../../components/formulaires/form-ajout-tarif-unitaire/form-ajout-tarif-unitaire.component";
import {FormulaireReserveBid, ReserveBid} from "../../../models/ReserveBid";
import {ReserveBidService} from "../../../services/api/reserve-bid.service";
import {ReserveBidStatus} from "../../../models/enum/ReserveBidStatus.enum";

@Component({
  selector: 'app-sites-production-resultat',
  templateUrl: './sites-production-resultat.component.html',
  styleUrls: ['./sites-production-resultat.component.css'],
})
export class SitesProductionResultatComponent implements OnInit {
  @Input() resultat?: RechercheSitesProductionEntite;
  @Output() reserveBidChange = new EventEmitter<FormulaireReserveBid>();

  InstanceEnum = Instance;

  TypeSiteEnum = TypeSite;
  typeInstance?: Instance;

  showDetails = false;

  reserveBids?: ReserveBid[];
  currentReserveBid?: ReserveBid;


  constructor(
    private instanceService: InstanceService,
    private bottomSheet: MatBottomSheet,
    private reserveBidService: ReserveBidService,
  ) {
  }

  ngOnInit() {
    this.instanceService.getTypeInstance().subscribe((typeInstance) => {
      this.typeInstance = typeInstance;
    });
  }

  open() {
    this.showDetails = true;
    this.reserveBidService.getReserveBidBySite(this.resultat!.meteringPointMrid)
      .subscribe(reserveBids => this.initReserveBids(reserveBids));
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
        this.reserveBidChange.emit(data)
      }
    });
  }

  private initReserveBids(reserveBids: ReserveBid[] | null) {
    // Order reserveBids
    this.reserveBids = reserveBids
      ?.sort((r1, r2) =>
        r1.validityPeriodStartDateTime == r2.validityPeriodStartDateTime
          ? r1.createdDateTime.localeCompare(r2.createdDateTime)
          : r1.validityPeriodStartDateTime.localeCompare(r2.validityPeriodStartDateTime)
      );
    // Find current reserveBid
    if (reserveBids != null) {
      let currentDate = new Date();
      for (let rb of reserveBids) {
        if ((currentDate.getTime() >= new Date(rb.validityPeriodStartDateTime).getTime()) && (rb.reserveBidStatus == ReserveBidStatus.VALIDATED)) {
          this.currentReserveBid = rb;
        } else {
          break;
        }
      }
    }
    console.log(this.currentReserveBid)
  }

}
