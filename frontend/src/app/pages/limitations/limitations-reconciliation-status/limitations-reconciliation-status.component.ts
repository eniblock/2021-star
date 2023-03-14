import {Component, Input, OnInit} from '@angular/core';
import {OrdreLimitation} from "../../../models/OrdreLimitation";
import {ReconciliationStatus} from "../../../models/enum/ReconciliationStatus.enum";
import {RechercheHistoriqueLimitationEntite} from "../../../models/RechercheHistoriqueLimitation";
import {DateHelper} from "../../../helpers/date.helper";

@Component({
  selector: 'app-limitations-reconciliation-status',
  templateUrl: './limitations-reconciliation-status.component.html',
  styleUrls: ['./limitations-reconciliation-status.component.css']
})
export class LimitationsReconciliationStatusComponent implements OnInit {

  @Input() rechercheHistoriqueLimitationEntite!: RechercheHistoriqueLimitationEntite;

  ReconciliationStatus = ReconciliationStatus;
  status?: ReconciliationStatus;
  nbMinutesDecalage = 0;

  constructor() {
  }

  ngOnInit(): void {
    if (this.rechercheHistoriqueLimitationEntite.subOrderList && this.rechercheHistoriqueLimitationEntite.subOrderList.length > 0) {
      const timestamp1 = DateHelper.stringToTimestamp(this.rechercheHistoriqueLimitationEntite.activationDocument.endCreatedDateTime);
      const timestamp2 = DateHelper.stringToTimestamp(this.rechercheHistoriqueLimitationEntite.subOrderList[0].endCreatedDateTime);
      this.nbMinutesDecalage = Math.round(Math.abs(timestamp2 - timestamp1) / 1000 / 60);
      this.status = this.rechercheHistoriqueLimitationEntite.activationDocument.reconciliationStatus
        ? this.rechercheHistoriqueLimitationEntite.activationDocument.reconciliationStatus
        : this.rechercheHistoriqueLimitationEntite.subOrderList[0].reconciliationStatus;
    }
  }

}
