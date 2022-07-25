import {Component, Input, OnInit} from '@angular/core';
import {SystemOperator} from "../../../models/SystemOperator";
import {SystemOperatorService} from "../../../services/api/system-operator.service";

@Component({
  selector: 'app-activation-horodates',
  templateUrl: './activation-horodates.component.html',
  styleUrls: ['./activation-horodates.component.css']
})
export class ActivationHorodatesComponent implements OnInit {

  @Input() showStartDates = false;
  @Input() showEndDates = false;
  @Input() element: any;

  systemOperators: SystemOperator[] = [];
  loaded = false;

  constructor(
    private systemOperatorService: SystemOperatorService,
  ) {
  }

  ngOnInit(): void {
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

}
