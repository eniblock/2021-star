import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {EligibilityStatus} from "../../../models/enum/EligibilityStatus.enum";

@Component({
  selector: 'app-activation-indemnisation',
  templateUrl: './activation-indemnisation.component.html',
  styleUrls: ['./activation-indemnisation.component.css']
})
export class ActivationIndemnisationComponent implements OnInit, OnChanges {

  @Input() eligibilityStatus: EligibilityStatus | null = null;
  @Input() eligibilityStatusEditable: boolean = false;

  public buttonClass = "";
  public loading = false;
  public marginIcons = "";

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    switch (this.eligibilityStatus) {
      case EligibilityStatus.OUI:
        this.buttonClass = "text-success";
        break;
      case EligibilityStatus.NON:
        this.buttonClass = "text-danger";
        break;
      case null:
        this.buttonClass = "";
        break;
    }
    if (this.eligibilityStatus == EligibilityStatus.OUI || this.eligibilityStatus == EligibilityStatus.NON) {
      this.marginIcons = "ms-2";
    } else {
      this.marginIcons = "";
    }
  }

  click() {
    this.loading = true;
  }

}
