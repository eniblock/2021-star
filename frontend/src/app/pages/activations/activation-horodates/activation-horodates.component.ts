import {Component, Input, OnInit} from '@angular/core';
import {SystemOperator} from "../../../models/SystemOperator";
import {SystemOperatorService} from "../../../services/api/system-operator.service";
import {OrdreLimitation} from "../../../models/OrdreLimitation";
import {DateHelper} from "../../../helpers/date.helper";

@Component({
  selector: 'app-activation-horodates',
  templateUrl: './activation-horodates.component.html',
  styleUrls: ['./activation-horodates.component.css']
})
export class ActivationHorodatesComponent implements OnInit {

  @Input() showStartDates = false;
  @Input() showEndDates = false;
  @Input() ordreLimitation!: OrdreLimitation;
  @Input() ordreLimitationLinked?: OrdreLimitation;

  ordreLimitation1?: OrdreLimitation;
  ordreLimitation2?: OrdreLimitation;

  systemOperators: SystemOperator[] = [];
  loaded = false;

  constructor(
    private systemOperatorService: SystemOperatorService,
  ) {
  }

  ngOnInit(): void {
    this.sortOrdreLimitation();

    // Get systemOperators
    this.systemOperatorService.getSystemOperators().subscribe(systemOperators => {
      this.systemOperators = systemOperators;
      this.loaded = true;
    });
  }

  public getSystemOperatorName(mrid: string): string {
    for (const op of this.systemOperators) {
      if (op.systemOperatorMarketParticipantMrid == mrid) {
        return op.systemOperatorMarketParticipantName;
      }
    }
    return "";
  }

  private sortOrdreLimitation() {
    if (this.ordreLimitationLinked == undefined) {
      this.ordreLimitation1 = this.ordreLimitation;
    } else {
      const ordreLimitationStartTimestamp = DateHelper.stringToTimestamp(this.ordreLimitation.startCreatedDateTime);
      const ordreLimitationEndTimestamp = DateHelper.stringToTimestamp(this.ordreLimitation.endCreatedDateTime);
      const ordreLimitationLieStartTimestamp = DateHelper.stringToTimestamp(this.ordreLimitationLinked.startCreatedDateTime);
      const ordreLimitationLieEndTimestamp = DateHelper.stringToTimestamp(this.ordreLimitationLinked.endCreatedDateTime);
      if ((ordreLimitationStartTimestamp < ordreLimitationLieStartTimestamp)
        || (ordreLimitationStartTimestamp == ordreLimitationLieStartTimestamp && ordreLimitationEndTimestamp < ordreLimitationLieEndTimestamp)) {
        this.ordreLimitation1 = this.ordreLimitation;
        this.ordreLimitation2 = this.ordreLimitationLinked;
      } else {
        this.ordreLimitation1 = this.ordreLimitationLinked;
        this.ordreLimitation2 = this.ordreLimitation;
      }
    }
  }
}
